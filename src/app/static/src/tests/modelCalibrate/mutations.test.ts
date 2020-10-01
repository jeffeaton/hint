import {expectAllMutationsDefined} from "../testHelpers";
import {ModelCalibrateMutation, mutations} from "../../app/store/modelCalibrate/mutations";
import {mockModelCalibrateState} from "../mocks";

describe("ModelCalibrate mutations", () => {

    it("all mutation types are defined", () => {
        expectAllMutationsDefined(ModelCalibrateMutation, mutations);
    });

    it("FetchingModelCalibrateOptions sets fetching to true", () => {
        const state = mockModelCalibrateState();
        mutations[ModelCalibrateMutation.FetchingModelCalibrateOptions](state);
        expect(state.fetching).toBe(true);
    });

    it("ModelCalibrateOptionsFetched sets expected state values", () => {
        const state = mockModelCalibrateState({fetching: true, optionsFormMeta: {controlSections: []}});
        const payload = {controlSections: [{label: "TEST SECTION", controlGroups: []}]};
        mutations[ModelCalibrateMutation.ModelCalibrateOptionsFetched](state, {payload});
        expect(state.fetching).toBe(false);
        expect(state.optionsFormMeta).toStrictEqual(payload);
    });

    it("Update sets expected state values", () => {
        const state = mockModelCalibrateState({complete: true, optionsFormMeta: {controlSections: []}});
        const payload = {controlSections: [{label: "TEST SECTION", controlGroups: []}]};
        mutations[ModelCalibrateMutation.Update](state, payload);
        expect(state.complete).toBe(false);
        expect(state.optionsFormMeta).toBe(payload);
    });

    it("Calibrated sets complete to true", () => {
        const state = mockModelCalibrateState();
        mutations[ModelCalibrateMutation.Calibrated](state);
        expect(state.complete).toBe(true);
    });
});
