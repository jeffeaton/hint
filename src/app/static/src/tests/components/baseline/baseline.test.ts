import {createLocalVue, shallowMount} from '@vue/test-utils';
import Vuex from 'vuex';
import {BaselineActions} from "../../../app/store/baseline/actions";
import {mockBaselineState, mockError, mockMetadataState, mockPopulationResponse, mockShapeResponse} from "../../mocks";
import {BaselineState} from "../../../app/store/baseline/baseline";
import Baseline from "../../../app/components/baseline/Baseline.vue";
import FileUpload from "../../../app/components/FileUpload.vue";
import {MetadataState} from "../../../app/store/metadata/metadata";
import ErrorAlert from "../../../app/components/ErrorAlert.vue";
import LoadingSpinner from "../../../app/components/LoadingSpinner.vue";
import {expectTranslatedText} from "../../testHelpers";

const localVue = createLocalVue();

describe("Baseline upload component", () => {

    let actions: jest.Mocked<BaselineActions>;
    let mutations = {};

    const createSut = (baselineState?: Partial<BaselineState>, metadataState?: Partial<MetadataState>) => {

        actions = {
            getBaselineData: jest.fn(),
            uploadPJNZ: jest.fn(),
            uploadShape: jest.fn(),
            uploadPopulation: jest.fn(),
            deletePJNZ: jest.fn(),
            deleteShape: jest.fn(),
            deletePopulation: jest.fn(),
            deleteAll: jest.fn(),
            validate: jest.fn()
        };

        return new Vuex.Store({
            modules: {
                baseline: {
                    namespaced: true,
                    state: mockBaselineState(baselineState),
                    actions: {...actions},
                    mutations: {...mutations}
                },
                metadata: {
                    namespaced: true,
                    state: mockMetadataState(metadataState)
                }
            }
        });
    };

    it("pjnz upload accepts pjnz or zip files", () => {
        const store = createSut();
        const wrapper = shallowMount(Baseline, {store, localVue});
        expect(wrapper.findAll(FileUpload).at(0).props().accept).toBe("PJNZ,pjnz,.pjnz,.PJNZ,.zip,zip,ZIP,.ZIP");
    });

    it("pjnz is not valid if country is not present", () => {
        const store = createSut();
        const wrapper = shallowMount(Baseline, {store, localVue});
        expect(wrapper.findAll(FileUpload).at(0).props().valid).toBe(false);
        expect(wrapper.findAll(FileUpload).at(0).findAll("label").length).toBe(0);
    });

    it("pjnz is valid if country is present", () => {
        const store = createSut({country: "Malawi"});
        const wrapper = shallowMount(Baseline, {store, localVue});
        expect(wrapper.findAll(FileUpload).at(0).props().valid).toBe(true);
    });

    it("country name is passed to file upload component if country is present", () => {
        const store = createSut({country: "Malawi"});
        const wrapper = shallowMount(Baseline, {store, localVue});
        const label = wrapper.findAll(FileUpload).at(0).find("label");
        expectTranslatedText(label, "Country");
        expect(label.text()).toBe(": Malawi");
    });

    it("passes pjnz error to file upload", () => {
        const error = mockError("File upload went wrong");
        const store = createSut({pjnzError: error});
        const wrapper = shallowMount(Baseline, {store, localVue});
        expect(wrapper.findAll(FileUpload).at(0).props().error).toBe(error);
    });

    it("shows metadata error if present", () => {
        const plottingMetadataError = mockError("Metadata went wrong");
        const store = createSut({}, {plottingMetadataError});
        const wrapper = shallowMount(Baseline, {store, localVue});
        expect(wrapper.findAll(FileUpload).at(0).props().error).toBe(plottingMetadataError);
    });

    it("shows pjnz error, not metadata error, if both are present", () => {
        const pjnzError = mockError("File upload went wrong");
        const plottingMetadataError = mockError("Metadata went wrong");
        const store = createSut({pjnzError}, {plottingMetadataError});
        const wrapper = shallowMount(Baseline, {store, localVue});
        expect(wrapper.findAll(FileUpload).at(0).props().error).toBe(pjnzError);
    });

    it("shows baseline error if present", () => {
        const error = mockError("Baseline is inconsistent");
        const store = createSut({baselineError: error});
        const wrapper = shallowMount(Baseline, {store, localVue});
        expect(wrapper.find(ErrorAlert).props().error).toBe(error)
    });

    it("shows baseline validating indicator", () => {
        const store = createSut({validating: true});
        const wrapper = shallowMount(Baseline, {store, localVue});
        const validating = wrapper.find("#baseline-validating");
        expectTranslatedText(validating, "Validating...");
        expect(validating.findAll(LoadingSpinner).length).toEqual(1)
    });

    it("shape is not valid if shape is not present", () => {
        const store = createSut();
        const wrapper = shallowMount(Baseline, {store, localVue});
        expect(wrapper.findAll(FileUpload).at(1).props().valid).toBe(false);
    });

    it("shape is valid if shape is present", () => {
        const store = createSut({shape: mockShapeResponse()});
        const wrapper = shallowMount(Baseline, {store, localVue});
        expect(wrapper.findAll(FileUpload).at(1).props().valid).toBe(true);
    });

    it("passes shape error to file upload", () => {
        const error = mockError("File upload went wrong");
        const store = createSut({shapeError: error});
        const wrapper = shallowMount(Baseline, {store, localVue});
        expect(wrapper.findAll(FileUpload).at(1).props().error).toBe(error);
    });

    it("shape upload accepts geojson", () => {
        const store = createSut();
        const wrapper = shallowMount(Baseline, {store, localVue});
        expect(wrapper.findAll(FileUpload).at(1).props().accept).toBe("geojson,.geojson,GEOJSON,.GEOJSON");
    });

    it("population is not valid if population is not present", () => {
        const store = createSut();
        const wrapper = shallowMount(Baseline, {store, localVue});
        expect(wrapper.findAll(FileUpload).at(2).props().valid).toBe(false);
    });

    it("population is valid if population is present", () => {
        const store = createSut({population: mockPopulationResponse()});
        const wrapper = shallowMount(Baseline, {store, localVue});
        expect(wrapper.findAll(FileUpload).at(2).props().valid).toBe(true);
    });

    it("passes population error to file upload", () => {
        const error = mockError("File upload went wrong")
        const store = createSut({populationError: error});
        const wrapper = shallowMount(Baseline, {store, localVue});
        expect(wrapper.findAll(FileUpload).at(2).props().error).toBe(error);
    });

    it("population upload accepts csv", () => {
        const store = createSut();
        const wrapper = shallowMount(Baseline, {store, localVue});
        expect(wrapper.findAll(FileUpload).at(2).props().accept).toBe("csv,.csv");
    });

    it("upload pjnz dispatches baseline/uploadPJNZ", (done) => {
        expectUploadToDispatchAction(0, () => actions.uploadPJNZ, done);
    });

    it("upload shape dispatches baseline/uploadShape", (done) => {
        expectUploadToDispatchAction(1, () => actions.uploadShape, done);
    });

    it("upload population dispatches baseline/uploadPopulation", (done) => {
        expectUploadToDispatchAction(2, () => actions.uploadPopulation, done);
    });

    it("remove pjnz dispatches baseline/deletePJNZ", (done) => {
        expectDeleteToDispatchAction(0, () => actions.deletePJNZ, done);
    });

    it("remove shape dispatches baseline/deleteShape", (done) => {
        expectDeleteToDispatchAction(1, () => actions.deleteShape, done);
    });

    it("remove population dispatches baseline/deletePopulation", (done) => {
        expectDeleteToDispatchAction(2, () => actions.deletePopulation, done);
    });

    const expectUploadToDispatchAction = (index: number,
                                          action: () => jest.MockInstance<any, any>,
                                          done: jest.DoneCallback) => {
        const store = createSut();
        const wrapper = shallowMount(Baseline, {store, localVue});

        wrapper.findAll(FileUpload).at(index).props().upload({name: "TEST"});
        setTimeout(() => {
            expect(action().mock.calls[0][1]).toStrictEqual({name: "TEST"});
            done();
        });
    };

    const expectDeleteToDispatchAction = (index: number,
                                          action: () => jest.MockInstance<any, any>,
                                          done: jest.DoneCallback) => {
        const store = createSut();
        const wrapper = shallowMount(Baseline, {store, localVue});

        wrapper.findAll(FileUpload).at(index).props().deleteFile();
        setTimeout(() => {
            expect(action().mock.calls.length).toBe(1);
            done();
        });
    }
});
