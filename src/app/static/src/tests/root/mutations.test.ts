import {mutations, RootMutation} from "../../app/store/root/mutations";
import {initialModelRunState} from "../../app/store/modelRun/modelRun";
import {initialModelOptionsState} from "../../app/store/modelOptions/modelOptions";

import {
    mockAncResponse,
    mockBaselineState,
    mockError,
    mockErrorsState,
    mockLoadState,
    mockMetadataState,
    mockModelOptionsState,
    mockModelOutputState,
    mockModelRunState,
    mockModelCalibrateState,
    mockPlottingSelections,
    mockRootState,
    mockStepperState,
    mockSurveyAndProgramState,
    mockSurveyResponse
} from "../mocks";
import {DataType} from "../../app/store/surveyAndProgram/surveyAndProgram";
import {RootState} from "../../app/root";
import {
    BarchartSelections,
    ScaleType,
    initialPlottingSelectionsState
} from "../../app/store/plottingSelections/plottingSelections";
import {initialMetadataState} from "../../app/store/metadata/metadata";
import {initialModelOutputState} from "../../app/store/modelOutput/modelOutput";
import {initialLoadState} from "../../app/store/load/load";
import {initialErrorsState} from "../../app/store/errors/errors";
import {LanguageMutation} from "../../app/store/language/mutations";
import {Language} from "../../app/store/translations/locales";
import {router} from '../../app/router';
import {initialModelCalibrateState} from "../../app/store/modelCalibrate/modelCalibrate";

describe("Root mutations", () => {

    const populatedState = function () {
        return mockRootState({
            baseline: mockBaselineState({country: "Test Country", ready: true}),
            metadata: mockMetadataState({plottingMetadataError: mockError("Test Metadata Error")}),
            surveyAndProgram: mockSurveyAndProgramState({surveyError: mockError("Test Survey Error"), ready: true}),
            modelOptions: mockModelOptionsState({valid: true}),
            modelOutput: mockModelOutputState({selectedTab: "Barchart"}),
            modelRun: mockModelRunState({modelRunId: "123", ready: true}),
            modelCalibrate: mockModelCalibrateState({complete: true}),
            plottingSelections: mockPlottingSelections({barchart: {indicatorId: "Test Indicator"} as BarchartSelections}),
            stepper: mockStepperState({activeStep: 7}),
            load: mockLoadState({loadError: mockError("Test Load Error")}),
            errors: mockErrorsState({errors: [mockError("Test Error")]})
        });
    };

    const testOnlyExpectedModulesArePopulated = function (modules: string[], state: RootState) {
        const popState = populatedState();

        //These modules may or may not be reset depending on the last valid step
        expect(state.baseline).toStrictEqual(modules.includes("baseline") ? popState.baseline : mockBaselineState({ready: true}));
        expect(state.metadata).toStrictEqual(modules.includes("metadata") ? popState.metadata : initialMetadataState());
        expect(state.surveyAndProgram).toStrictEqual(modules.includes("surveyAndProgram") ? popState.surveyAndProgram :
            mockSurveyAndProgramState({ready: true}));
        expect(state.modelOptions).toStrictEqual(modules.includes("modelOptions") ? popState.modelOptions : initialModelOptionsState());
        expect(state.modelRun).toStrictEqual(modules.includes("modelRun") ? popState.modelRun : mockModelRunState({ready: true}));

        //These modules are always reset
        expect(state.modelOutput).toStrictEqual(initialModelOutputState());
        expect(state.plottingSelections).toStrictEqual(initialPlottingSelectionsState());
        expect(state.load).toStrictEqual(initialLoadState());
        expect(state.errors).toStrictEqual(initialErrorsState());

        //we skip stepper state this needs to be tested separately, activeStep may have been modified
    };

    it("reset step copies ADR properties", () => {
        const state = populatedState();
        state.adrDatasets = ["TEST DATASETS"];
        state.adrSchemas = ["TEST SCHEMAS"] as any;
        state.adrFetchingDatasets = true;
        state.adrKey = "TEST KEY";

        mutations.Reset(state, {payload: 0});
        expect(state.adrDatasets).toStrictEqual(["TEST DATASETS"]);
        expect(state.adrSchemas).toStrictEqual(["TEST SCHEMAS"]);
        expect(state.adrFetchingDatasets).toBe(true);
        expect(state.adrKey).toBe("TEST KEY");
    });

    it("can reset state where max valid step is 0", () => {
        const state = populatedState();

        mutations.Reset(state, {payload: 0});

        testOnlyExpectedModulesArePopulated([], state);
        expect(state.stepper.activeStep).toBe(1);
    });

    it("can reset state where max valid step is 1", () => {
        const state = populatedState();

        mutations.Reset(state, {payload: 1});

        testOnlyExpectedModulesArePopulated(["baseline", "metadata"], state);
        expect(state.stepper.activeStep).toBe(1);
    });

    it("can reset state where max valid step is 2", () => {
        const state = populatedState();

        mutations.Reset(state, {payload: 2});

        testOnlyExpectedModulesArePopulated(["baseline", "metadata", "surveyAndProgram"], state);
        expect(state.stepper.activeStep).toBe(2);
    });

    it("can reset state where max valid step is 3", () => {
        const state = populatedState();

        mutations.Reset(state, {payload: 3});

        testOnlyExpectedModulesArePopulated(["baseline", "metadata", "surveyAndProgram", "modelOptions"], state);
        expect(state.stepper.activeStep).toBe(3);
    });

    it("can reset state where max valid step is 4", () => {
        const state = populatedState();

        mutations.Reset(state, {payload: 4});

        testOnlyExpectedModulesArePopulated(["baseline", "metadata", "surveyAndProgram", "modelOptions", "modelRun"], state);
        expect(state.stepper.activeStep).toBe(4);
    });

    it("can reset state where max valid step is 5", () => {
        const state = populatedState();

        mutations.Reset(state, {payload: 5});

        testOnlyExpectedModulesArePopulated(["baseline", "metadata", "surveyAndProgram", "modelOptions", "modelRun", "modelCalibrate"], state);
        expect(state.stepper.activeStep).toBe(5);
    });

    it("can reset state where max valid step is 6", () => {
        const state = populatedState();

        mutations.Reset(state, {payload: 6});

        testOnlyExpectedModulesArePopulated(["baseline", "metadata", "surveyAndProgram", "modelOptions", "modelRun", "modelCalibrate"], state);
        expect(state.stepper.activeStep).toBe(5);
    });

    it("sets selected data type to null if no valid type available", () => {

        const state = mockRootState({
            surveyAndProgram: mockSurveyAndProgramState({
                selectedDataType: DataType.ANC
            })
        });

        mutations.ResetSelectedDataType(state);
        expect(state.surveyAndProgram.selectedDataType).toBe(null);
    });

    it("sets selected data type to available type if there is one", () => {

        const state = mockRootState({
            surveyAndProgram: mockSurveyAndProgramState({
                survey: mockSurveyResponse(),
                selectedDataType: DataType.ANC
            })
        });

        mutations.ResetSelectedDataType(state);
        expect(state.surveyAndProgram.selectedDataType).toBe(DataType.Survey);
    });

    it("leaves selected data type as is if valid", () => {

        const state = mockRootState({
            surveyAndProgram: mockSurveyAndProgramState({
                anc: mockAncResponse(),
                selectedDataType: DataType.ANC
            })
        });

        mutations.ResetSelectedDataType(state);
        expect(state.surveyAndProgram.selectedDataType).toBe(DataType.ANC);
    });

    it("can reset model options state", () => {

        const state = mockRootState({
            modelOptions: mockModelOptionsState({options: "TEST" as any})
        });

        mutations.ResetOptions(state);
        expect(state.modelOptions).toStrictEqual(initialModelOptionsState());
    });

    it("can reset model outputs state", () => {

        const state = mockRootState({
            modelRun: mockModelRunState({modelRunId: "TEST"}),
            modelOutput: {selectedTab: "TEST"},
            modelCalibrate: mockModelCalibrateState({complete: true})
        });

        state.plottingSelections.barchart.xAxisId = "test";
        state.plottingSelections.outputChoropleth.detail = 4;

        //These should not be reset
        state.plottingSelections.sapChoropleth.detail = 2;
        state.plottingSelections.colourScales.anc = {
            testIndicator: {type: ScaleType.Custom} as any
        };

        mutations.ResetOutputs(state);
        expect(state.modelRun).toStrictEqual({...initialModelRunState(), ready: true});
        expect(state.modelOutput.selectedTab).toBe("");

        expect(state.plottingSelections.barchart.xAxisId).toBe("");
        expect(state.plottingSelections.outputChoropleth.detail).toBe(-1);
        expect(state.plottingSelections.sapChoropleth.detail).toBe(2);
        expect(state.plottingSelections.colourScales.anc.testIndicator.type).toBe(ScaleType.Custom);

        expect(state.modelCalibrate).toStrictEqual(initialModelCalibrateState())
    });

    it("can change language", () => {
        const state = mockRootState();
        mutations[LanguageMutation.ChangeLanguage](state, {payload: "fr"});
        expect(state.language).toBe("fr");
    });

    it("can reset for new version", () => {
        const state = populatedState();
        state.language = Language.fr;
        state.adrDatasets = ["TEST DATASETA"];
        state.adrSchemas = ["TEST SCHEMAS"] as any;
        state.adrFetchingDatasets = true;
        state.adrKey = "TEST KEY";

        const mockRouterPush = jest.fn();
        router.push = mockRouterPush;

        const version = {id: 1, name: "newVersion", versions: [{id: "newVersion"}]};
        mutations.SetProject(state, {payload: version});

        testOnlyExpectedModulesArePopulated([], state);
        expect(state.stepper.activeStep).toBe(1);

        expect(state.projects.currentProject).toBe(version);
        expect(state.projects.currentVersion).toBe(version.versions[0]);

        expect(state.language).toBe(Language.fr);
        expect(state.adrDatasets).toStrictEqual(["TEST DATASETA"]);
        expect(state.adrSchemas).toStrictEqual(["TEST SCHEMAS"]);
        expect(state.adrKey).toBe("TEST KEY");
        expect(state.adrFetchingDatasets).toBe(false);

        expect(state.baseline.ready).toBe(true);
        expect(state.surveyAndProgram.ready).toBe(true);
        expect(state.modelRun.ready).toBe(true);

        expect(mockRouterPush.mock.calls.length).toBe(1);
        expect(mockRouterPush.mock.calls[0][0]).toBe("/");
    });

    it("can update ADR key", () => {
        const state = mockRootState();
        mutations[RootMutation.UpdateADRKey](state, {payload: "new-key"});
        expect(state.adrKey).toBe("new-key");

        mutations[RootMutation.UpdateADRKey](state, {payload: null});
        expect(state.adrKey).toBe(null);
    });

    it("can set ADR key error", () => {
        const state = mockRootState();
        mutations[RootMutation.SetADRKeyError](state, {payload: mockError("whatevs")});
        expect(state.adrKeyError!!.detail).toBe("whatevs");

        mutations[RootMutation.SetADRKeyError](state, {payload: null});
        expect(state.adrKeyError).toBe(null);
    });

    it("can set ADR datasets", () => {
        const state = mockRootState();
        mutations[RootMutation.SetADRDatasets](state, {payload: [1, 2, 3]});
        expect(state.adrDatasets).toEqual([1, 2, 3]);
    });

    it("can set ADR fetching datasets", () => {
        const state = mockRootState({adrFetchingDatasets: false});
        mutations[RootMutation.SetADRFetchingDatasets](state, {payload: true});
        expect(state.adrFetchingDatasets).toBe(true);
    });

    it("can set ADR schemas", () => {
        const state = mockRootState();
        mutations[RootMutation.SetADRSchemas](state, {payload: {baseUrl: "adr.com"}});
        expect(state.adrSchemas).toEqual({baseUrl: "adr.com"});
    });
});
