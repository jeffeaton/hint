import Vuex, {ActionTree} from "vuex";
import Vue from "vue";
import {mount, shallowMount} from "@vue/test-utils";
import SelectDataset from "../../../app/components/adr/SelectDataset.vue";
import Modal from "../../../app/components/Modal.vue";
import TreeSelect from '@riophae/vue-treeselect'
import {mockBaselineState, mockDataset, mockDatasetResource, mockRootState, mockShapeResponse} from "../../mocks";
import {BaselineState} from "../../../app/store/baseline/baseline";
import LoadingSpinner from "../../../app/components/LoadingSpinner.vue";
import {BaselineMutation} from "../../../app/store/baseline/mutations";
import {BaselineActions} from "../../../app/store/baseline/actions";
import {SurveyAndProgramActions} from "../../../app/store/surveyAndProgram/actions";
import {ADRSchemas} from "../../../app/types";
import {RootState} from "../../../app/root";
import {InfoIcon} from "vue-feather-icons";
import Mock = jest.Mock;

describe("select dataset", () => {

    const schemas: ADRSchemas = {
        baseUrl: "www.adr.com/",
        anc: "anc",
        programme: "prog",
        pjnz: "pjnz",
        population: "pop",
        shape: "shape",
        survey: "survey"
    }

    const pjnz = {resource_type: schemas.pjnz, url: "pjnz.pjnz", revision_id: "pj1234"}
    const shape = {resource_type: schemas.shape, url: "shape.geojson", revision_id: "sh1234"}
    const pop = {resource_type: schemas.population, url: "pop.csv", revision_id: "po1234"}
    const survey = {resource_type: schemas.survey, url: "survey.csv", revision_id: "su1234"}
    const program = {resource_type: schemas.programme, url: "program.csv", revision_id: "pr1234"}
    const anc = {resource_type: schemas.anc, url: "anc.csv", revision_id: "an1234"}

    const fakeRawDatasets = [{
        id: "id1",
        title: "Some data",
        organization: {title: "org"},
        name: "some-data",
        revision_id: "456",
        type: "naomi-data",
        resources: []
    }]

    const fakeDataset = {
        id: "id1",
        title: "Some data",
        url: "www.adr.com/naomi-data/some-data",
        resources: {
            pjnz: null,
            program: null,
            pop: null,
            survey: null,
            shape: mockDatasetResource({url: "shape.geojson", revisionId: "sh1234"}),
            anc: null
        }
    }

    const setDatasetMock = jest.fn();
    const markResourcesUpdatedMock = jest.fn();

    const baselineActions: Partial<BaselineActions> & ActionTree<any, any> = {
        importShape: jest.fn(),
        importPopulation: jest.fn(),
        importPJNZ: jest.fn(),
        refreshDatasetMetadata: jest.fn()
    }

    const surveyProgramActions: Partial<SurveyAndProgramActions> & ActionTree<any, any> = {
        importSurvey: jest.fn(),
        importProgram: jest.fn(),
        importANC: jest.fn()
    }

    const getStore = (baselineProps: Partial<BaselineState> = {}, rootProps: Partial<RootState> = {}) => {
        return new Vuex.Store({
            state: mockRootState({
                adrSchemas: schemas,
                adrDatasets: fakeRawDatasets,
                ...rootProps
            }),
            modules: {
                baseline: {
                    namespaced: true,
                    state: mockBaselineState(baselineProps),
                    actions: baselineActions,
                    mutations: {
                        [BaselineMutation.SetDataset]: setDatasetMock,
                        [BaselineMutation.MarkDatasetResourcesUpdated]: markResourcesUpdatedMock
                    }
                },
                surveyAndProgram: {
                    namespaced: true,
                    actions: surveyProgramActions
                }
            }
        });
    }

    afterEach(() => {
        jest.resetAllMocks();
    });

    it("refreshes selected dataset metdata on mount", () => {
        const rendered = shallowMount(SelectDataset, {store: getStore()});
        expect((baselineActions.refreshDatasetMetadata as Mock).mock.calls.length).toBe(1);
    });

    it("renders select dataset button when no dataset is selected", () => {
        const rendered = shallowMount(SelectDataset, {store: getStore()});
        expect(rendered.find("button").text()).toBe("Select ADR dataset");
    });

    it("renders edit dataset button when dataset is already selected", () => {
        const rendered = shallowMount(SelectDataset, {
            store: getStore({
                selectedDataset: fakeDataset
            })
        });
        expect(rendered.find("button").text()).toBe("Edit");
    });

    it("does not render refresh button or info icon when no resources are out of date", () => {
        const rendered = shallowMount(SelectDataset, {
            store: getStore({
                selectedDataset: fakeDataset
            })
        });
        expect(rendered.findAll("button").length).toBe(1);
        expect(rendered.findAll(InfoIcon).length).toBe(0);
    });

    it("shows refresh button and info icon if any resource is out of date", () => {
        const fakeDataset = mockDataset();
        fakeDataset.resources.pjnz = mockDatasetResource({outOfDate: true});
        const store = getStore({selectedDataset: fakeDataset});
        const mockTooltipDirective = jest.fn();
        const rendered = mount(SelectDataset, {
            store,
            directives: {"tooltip": mockTooltipDirective},
            stubs: ["tree-select"]
        });
        const buttons = rendered.findAll("button");
        expect(buttons.at(0).text()).toBe("Refresh");
        expect(buttons.at(1).text()).toBe("Edit");

        expect(rendered.findAll(InfoIcon).length).toBe(1);

        expect(mockTooltipDirective.mock.calls[0][0].innerHTML)
            .toContain("<circle cx=\"12\" cy=\"12\" r=\"10\"></circle>"); // tooltip should be on the icon
        expect(mockTooltipDirective.mock.calls[0][1].value)
            .toBe("This dataset has been updated in the ADR. Use the refresh button to import the latest files.");
    });

    it("refreshes out of date baseline files", async () => {
        const fakeDataset = mockDataset();
        fakeDataset.resources.pjnz = mockDatasetResource({outOfDate: true, url: "pjnz.url"});
        fakeDataset.resources.pop = mockDatasetResource({outOfDate: true, url: "pop.url"});
        fakeDataset.resources.shape = mockDatasetResource({outOfDate: true, url: "shape.url"});

        const store = getStore({selectedDataset: fakeDataset});
        const rendered = shallowMount(SelectDataset, {store, sync: false});
        rendered.findAll("button").at(0).trigger("click");
        await Vue.nextTick();
        expect(rendered.find(Modal).props("open")).toBe(true);
        expect(rendered.findAll(LoadingSpinner).length).toBe(1);
        expect((baselineActions.importPJNZ as Mock).mock.calls[0][1]).toBe("pjnz.url");
        expect((baselineActions.importPopulation as Mock).mock.calls[0][1]).toBe("pop.url");
        expect((baselineActions.importShape as Mock).mock.calls[0][1]).toBe("shape.url");
    });

    it("marks resources are updated after refreshing", async () => {
        const fakeDataset = mockDataset();
        fakeDataset.resources.pjnz = mockDatasetResource({outOfDate: true, url: "pjnz.url"})
        const store = getStore({selectedDataset: fakeDataset});
        const rendered = shallowMount(SelectDataset, {store, sync: false});
        rendered.findAll("button").at(0).trigger("click");

        await Vue.nextTick();
        await Vue.nextTick();

        expect(markResourcesUpdatedMock.mock.calls.length).toBe(1);
    });

    it("renders modal and spinner while refreshing", async () => {
        const fakeDataset = mockDataset();
        fakeDataset.resources.pjnz = mockDatasetResource({outOfDate: true, url: "pjnz.url"})
        const store = getStore({selectedDataset: fakeDataset});
        const rendered = shallowMount(SelectDataset, {store, sync: false});
        rendered.findAll("button").at(0).trigger("click");

        await Vue.nextTick();

        expect(rendered.find(Modal).props("open")).toBe(true);
        expect(rendered.findAll(LoadingSpinner).length).toBe(1);

        await Vue.nextTick();
        await Vue.nextTick();

        expect(rendered.find(Modal).props("open")).toBe(false);
        expect(rendered.findAll(LoadingSpinner).length).toBe(0);
    });

    it("refreshes survey & program files if any baseline file is refreshed and pre-existing shape file present",
        async () => {
            const fakeDataset = mockDataset();
            fakeDataset.resources.pjnz = mockDatasetResource({outOfDate: true, url: "pjnz.url"});
            fakeDataset.resources.survey = mockDatasetResource({url: "survey.url"});
            fakeDataset.resources.program = mockDatasetResource({url: "program.url"});
            fakeDataset.resources.anc = mockDatasetResource({url: "anc.url"});
            const store = getStore({selectedDataset: fakeDataset, shape: mockShapeResponse()});
            const rendered = shallowMount(SelectDataset, {store, sync: false});
            rendered.findAll("button").at(0).trigger("click");
            await Vue.nextTick();
            await Vue.nextTick();
            await Vue.nextTick();
            expect((surveyProgramActions.importSurvey as Mock).mock.calls[0][1]).toBe("survey.url");
            expect((surveyProgramActions.importProgram as Mock).mock.calls[0][1]).toBe("program.url");
            expect((surveyProgramActions.importANC as Mock).mock.calls[0][1]).toBe("anc.url");
        });

    it("refreshes survey & program files if any baseline file is refreshed and shape file included in resources",
        async () => {
            const fakeDataset = mockDataset();
            fakeDataset.resources.pjnz = mockDatasetResource({outOfDate: true, url: "pjnz.url"});
            fakeDataset.resources.survey = mockDatasetResource({url: "survey.url"});
            fakeDataset.resources.program = mockDatasetResource({url: "program.url"});
            fakeDataset.resources.anc = mockDatasetResource({url: "anc.url"});
            fakeDataset.resources.shape = mockDatasetResource();
            const store = getStore({selectedDataset: fakeDataset});
            const rendered = shallowMount(SelectDataset, {store, sync: false});
            rendered.findAll("button").at(0).trigger("click");
            await Vue.nextTick();
            await Vue.nextTick();
            await Vue.nextTick();
            expect((surveyProgramActions.importSurvey as Mock).mock.calls[0][1]).toBe("survey.url");
            expect((surveyProgramActions.importProgram as Mock).mock.calls[0][1]).toBe("program.url");
            expect((surveyProgramActions.importANC as Mock).mock.calls[0][1]).toBe("anc.url");
        });

    it("refreshes survey & program files if out of date",
        async () => {
            const fakeDataset = mockDataset();
            fakeDataset.resources.survey = mockDatasetResource({url: "survey.url", outOfDate: true});
            fakeDataset.resources.program = mockDatasetResource({url: "program.url", outOfDate: true});
            fakeDataset.resources.anc = mockDatasetResource({url: "anc.url", outOfDate: true});
            fakeDataset.resources.shape = mockDatasetResource();
            const store = getStore({selectedDataset: fakeDataset});
            const rendered = shallowMount(SelectDataset, {store, sync: false});
            rendered.findAll("button").at(0).trigger("click");
            await Vue.nextTick();
            await Vue.nextTick();
            await Vue.nextTick();
            expect((surveyProgramActions.importSurvey as Mock).mock.calls[0][1]).toBe("survey.url");
            expect((surveyProgramActions.importProgram as Mock).mock.calls[0][1]).toBe("program.url");
            expect((surveyProgramActions.importANC as Mock).mock.calls[0][1]).toBe("anc.url");
        });

    it("renders selected dataset if it exists", () => {
        const rendered = shallowMount(SelectDataset, {
            store: getStore({
                selectedDataset: fakeDataset
            })
        });
        expect(rendered.find(".font-weight-bold").text()).toBe("Selected dataset:");
        expect(rendered.find("a").text()).toBe("Some data");
        expect(rendered.find("a").attributes("href")).toBe("www.adr.com/naomi-data/some-data");
    });

    it("does not render selected dataset if it doesn't exist", () => {
        const rendered = shallowMount(SelectDataset, {store: getStore()});
        expect(rendered.findAll(".font-weight-bold").length).toBe(0);
        expect(rendered.findAll("a").length).toBe(0);
    });

    it("can open modal", () => {
        const rendered = shallowMount(SelectDataset, {store: getStore()});
        expect(rendered.find(Modal).props("open")).toBe(false);
        rendered.find("button").trigger("click");
        expect(rendered.find(Modal).props("open")).toBe(true);
    });

    it("can close modal", () => {
        const rendered = mount(SelectDataset, {store: getStore(), stubs: ["tree-select"]});
        rendered.find("button").trigger("click");
        expect(rendered.find(Modal).props("open")).toBe(true);
        rendered.find(Modal).findAll("button").at(1).trigger("click");
        expect(rendered.find(Modal).props("open")).toBe(false);
    });

    it("renders select", async () => {
        const rendered = shallowMount(SelectDataset, {store: getStore()});
        rendered.find("button").trigger("click");
        const select = rendered.find(TreeSelect);
        expect(select.props("multiple")).toBe(false);
        expect(select.props("searchable")).toBe(true);

        const expectedOptions = [{
            id: "id1",
            label: "Some data",
            customLabel: `Some data
                    <div class="text-muted small" style="margin-top:-5px; line-height: 0.8rem">
                        (some-data)<br/>
                        <span class="font-weight-bold">org</span>
                    </div>`
        }]
        expect(select.props("options")).toStrictEqual(expectedOptions);
    });

    it("sets current dataset", async () => {
        const rendered = mount(SelectDataset, {
            store: getStore({},
                {adrDatasets: [{...fakeRawDatasets[0], resources: [shape]}]}
            ), sync: false, stubs: ["tree-select"]
        });
        rendered.find("button").trigger("click");

        await Vue.nextTick();

        expect(rendered.findAll(TreeSelect).length).toBe(1);
        expect(rendered.find(Modal).findAll("button").length).toBe(2);
        expect(rendered.findAll("p").length).toBe(0);
        expect(rendered.find("h4").text()).toBe("Browse ADR");

        rendered.setData({newDatasetId: "id1"});
        rendered.find(Modal).find("button").trigger("click");

        await Vue.nextTick();
        expect(setDatasetMock.mock.calls[0][1]).toEqual(fakeDataset);

        // loading spinner should render and buttons hidden
        const buttons = rendered.find(Modal).findAll("button");
        expect(rendered.findAll(TreeSelect).length).toBe(0);
        expect(rendered.findAll(LoadingSpinner).length).toBe(1);
        expect(buttons.length).toBe(0);
        expect(rendered.find("p").text())
            .toBe("Importing files - this may take several minutes. Please do not close your browser.");
        expect(rendered.findAll("h4").length).toBe(0);

        await Vue.nextTick();
        await Vue.nextTick();
        await Vue.nextTick();

        expect(rendered.findAll(LoadingSpinner).length).toBe(0);
        expect(rendered.find(Modal).props("open")).toBe(false);
    });

    it("imports baseline files if they exist", async () => {
        const store = getStore({}, {
            adrDatasets: [{...fakeRawDatasets[0], resources: [pjnz, pop, shape]}]
        })
        const rendered = mount(SelectDataset, {store, sync: false, stubs: ["tree-select"]});
        rendered.find("button").trigger("click");

        await Vue.nextTick();

        expect(rendered.findAll(TreeSelect).length).toBe(1);
        rendered.setData({newDatasetId: "id1"});
        rendered.find(Modal).find("button").trigger("click");

        await Vue.nextTick();

        expect(rendered.findAll(LoadingSpinner).length).toBe(1);

        await Vue.nextTick();

        expect((baselineActions.importPJNZ as Mock).mock.calls[0][1]).toBe("pjnz.pjnz");
        expect((baselineActions.importPopulation as Mock).mock.calls[0][1]).toBe("pop.csv");
        expect((baselineActions.importShape as Mock).mock.calls[0][1]).toBe("shape.geojson");

        await Vue.nextTick(); // once for baseline actions to return
        await Vue.nextTick(); // once for survey actions to return

        expect(rendered.findAll(LoadingSpinner).length).toBe(0);
        expect(rendered.find(Modal).props("open")).toBe(false);
    });

    it("does not import baseline file if it doesn't exist", async () => {
        const store = getStore({}, {
            adrDatasets: [{...fakeRawDatasets[0], resources: [pjnz]}]
        })
        const rendered = mount(SelectDataset, {store, sync: false, stubs: ["tree-select"]});
        rendered.find("button").trigger("click");

        await Vue.nextTick();

        expect(rendered.findAll(TreeSelect).length).toBe(1);
        rendered.setData({newDatasetId: "id1"});
        rendered.find(Modal).find("button").trigger("click");

        await Vue.nextTick();

        expect(rendered.findAll(LoadingSpinner).length).toBe(1);

        await Vue.nextTick();

        expect((baselineActions.importPJNZ as Mock).mock.calls[0][1]).toBe("pjnz.pjnz");
        expect((baselineActions.importPopulation as Mock).mock.calls.length).toBe(0);
        expect((baselineActions.importShape as Mock).mock.calls.length).toBe(0);

        await Vue.nextTick();
        // await just one tick for baseline actions to return, survey actions will not fire
        // because shape is not present

        expect(rendered.findAll(LoadingSpinner).length).toBe(0);
        expect(rendered.find(Modal).props("open")).toBe(false);
    });

    it("imports survey and program files if they exist and shape file exists", async () => {
        const store = getStore({}, {
            adrDatasets: [{...fakeRawDatasets[0], resources: [shape, survey, program, anc]}]
        })
        const rendered = mount(SelectDataset, {store, sync: false, stubs: ["tree-select"]});
        rendered.find("button").trigger("click");

        await Vue.nextTick();

        expect(rendered.findAll(TreeSelect).length).toBe(1);
        rendered.setData({newDatasetId: "id1"});
        rendered.find(Modal).find("button").trigger("click");

        await Vue.nextTick();

        expect(rendered.findAll(LoadingSpinner).length).toBe(1);

        await Vue.nextTick();

        expect((surveyProgramActions.importSurvey as Mock).mock.calls[0][1]).toBe("survey.csv");
        expect((surveyProgramActions.importProgram as Mock).mock.calls[0][1]).toBe("program.csv");
        expect((surveyProgramActions.importANC as Mock).mock.calls[0][1]).toBe("anc.csv");

        await Vue.nextTick(); // once for baseline actions to return
        await Vue.nextTick(); // once for survey actions to return

        expect(rendered.findAll(LoadingSpinner).length).toBe(0);
        expect(rendered.find(Modal).props("open")).toBe(false);
    });

    it("does not import survey and program file if it doesn't exist", async () => {
        const store = getStore({}, {
            adrDatasets: [{...fakeRawDatasets[0], resources: [shape, survey]}]
        })
        const rendered = mount(SelectDataset, {store, sync: false, stubs: ["tree-select"]});
        rendered.find("button").trigger("click");

        await Vue.nextTick();

        expect(rendered.findAll(TreeSelect).length).toBe(1);
        rendered.setData({newDatasetId: "id1"});
        rendered.find(Modal).find("button").trigger("click");

        await Vue.nextTick();

        expect(rendered.findAll(LoadingSpinner).length).toBe(1);

        await Vue.nextTick();

        expect((surveyProgramActions.importSurvey as Mock).mock.calls[0][1]).toBe("survey.csv");
        expect((surveyProgramActions.importProgram as Mock).mock.calls.length).toBe(0);
        expect((surveyProgramActions.importANC as Mock).mock.calls.length).toBe(0);

        await Vue.nextTick(); // once for baseline actions to return
        await Vue.nextTick(); // once for survey actions to return

        expect(rendered.findAll(LoadingSpinner).length).toBe(0);
        expect(rendered.find(Modal).props("open")).toBe(false);
    });

    it("does not import any survey and program files if shape file doesn't exist", async () => {
        const store = getStore({}, {
            adrDatasets: [{...fakeRawDatasets[0], resources: [survey, program, anc]}]
        })
        const rendered = mount(SelectDataset, {store, sync: false, stubs: ["tree-select"]});
        rendered.find("button").trigger("click");

        await Vue.nextTick();

        expect(rendered.findAll(TreeSelect).length).toBe(1);
        rendered.setData({newDatasetId: "id1"});
        rendered.find(Modal).find("button").trigger("click");

        await Vue.nextTick();

        expect(rendered.findAll(LoadingSpinner).length).toBe(1);

        await Vue.nextTick();

        expect((surveyProgramActions.importSurvey as Mock).mock.calls.length).toBe(0);
        expect((surveyProgramActions.importProgram as Mock).mock.calls.length).toBe(0);
        expect((surveyProgramActions.importANC as Mock).mock.calls.length).toBe(0);

        await Vue.nextTick();
        // await just one tick for baseline actions to return, survey actions will not fire
        // because shape is not present

        expect(rendered.findAll(LoadingSpinner).length).toBe(0);
        expect(rendered.find(Modal).props("open")).toBe(false);
    });

    it("imports survey and program files if pre-existing shape file is present", async () => {
        const store = getStore(
            {
                shape: mockShapeResponse()
            },
            {
                adrDatasets: [{...fakeRawDatasets[0], resources: [survey, program, anc]}]
            });

        const rendered = mount(SelectDataset, {store, sync: false, stubs: ["tree-select"]});
        rendered.find("button").trigger("click");

        await Vue.nextTick();

        expect(rendered.findAll(TreeSelect).length).toBe(1);
        rendered.setData({newDatasetId: "id1"});
        rendered.find(Modal).find("button").trigger("click");

        await Vue.nextTick();

        expect(rendered.findAll(LoadingSpinner).length).toBe(1);

        await Vue.nextTick();

        expect((surveyProgramActions.importSurvey as Mock).mock.calls[0][1]).toBe("survey.csv");
        expect((surveyProgramActions.importProgram as Mock).mock.calls[0][1]).toBe("program.csv");
        expect((surveyProgramActions.importANC as Mock).mock.calls[0][1]).toBe("anc.csv");

        await Vue.nextTick(); // once for baseline actions to return
        await Vue.nextTick(); // once for survey actions to return

        expect(rendered.findAll(LoadingSpinner).length).toBe(0);
        expect(rendered.find(Modal).props("open")).toBe(false);
    });

});
