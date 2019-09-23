import {createLocalVue, shallowMount, Wrapper} from '@vue/test-utils';
import Vue from 'vue';
import Vuex, {Store} from 'vuex';
import {baselineGetters, BaselineState} from "../../app/store/baseline/baseline";
import {
    mockBaselineState,
    mockModelRunState,
    mockPopulationResponse,
    mockShapeResponse,
    mockSurveyAndProgramState
} from "../mocks";
import {SurveyAndProgramDataState, surveyAndProgramGetters} from "../../app/store/surveyAndProgram/surveyAndProgram";
import {mutations} from '../../app/store/baseline/mutations';
import {mutations as surveyAndProgramMutations} from '../../app/store/surveyAndProgram/mutations';
import {ModelRunState} from "../../app/store/modelRun/modelRun";

import Stepper from "../../app/components/Stepper.vue";
import Step from "../../app/components/Step.vue";
import LoadingSpinner from "../../app/components/LoadingSpinner.vue";

const localVue = createLocalVue();
Vue.use(Vuex);

describe("Stepper component", () => {
    const createSut = (baselineState?: Partial<BaselineState>,
                       surveyAndProgramState?: Partial<SurveyAndProgramDataState>,
                       modelRunState?: Partial<ModelRunState>) => {

        return new Vuex.Store({
            modules: {
                baseline: {
                    namespaced: true,
                    state: mockBaselineState(baselineState),
                    getters: baselineGetters,
                    mutations
                },
                surveyAndProgram: {
                    namespaced: true,
                    state: mockSurveyAndProgramState(surveyAndProgramState),
                    getters: surveyAndProgramGetters,
                    mutations: surveyAndProgramMutations
                },
                modelRun: {
                    namespaced: true,
                    state: mockModelRunState(modelRunState)
                }
            }
        })
    };
    afterEach(() => {
        localStorage.clear();
    });

    it("renders loading spinner while states are not ready", () => {

        const store = createSut();
        const wrapper = shallowMount(Stepper, {store, localVue});
        expect(wrapper.findAll(LoadingSpinner).length).toBe(1);
        expect(wrapper.findAll(".content").length).toBe(0);
        expect(wrapper.find("#loading-message").text()).toBe("Loading your data");
    });

    it("does not render loading spinner once states are ready", () => {
        const store = createSut({ready: true}, {ready: true});
        const wrapper = shallowMount(Stepper, {store, localVue});
        expect(wrapper.findAll(LoadingSpinner).length).toBe(0);
        expect(wrapper.findAll(".content").length).toBe(1);
        expect(wrapper.findAll("#loading-message").length).toBe(0);
    });

    it("renders steps", () => {
        const store = createSut({ready: true}, {ready: true});
        const wrapper = shallowMount(Stepper, {store, localVue});
        const steps = wrapper.findAll(Step);

        expect(wrapper.findAll(Step).length).toBe(5);
        expect(steps.at(0).props().text).toBe("Upload baseline data");
        expect(steps.at(0).props().active).toBe(true);
        expect(steps.at(0).props().number).toBe(1);
        expect(steps.at(0).props().complete).toBe(false);

        expect(steps.at(1).props().text).toBe("Upload survey and programme data");
        expect(steps.at(1).props().active).toBe(false);
        expect(steps.at(1).props().number).toBe(2);
        expect(steps.at(1).props().complete).toBe(false);

        expect(steps.at(2).props().text).toBe("Review uploads");
        expect(steps.at(2).props().active).toBe(false);
        expect(steps.at(2).props().number).toBe(3);
        expect(steps.at(2).props().complete).toBe(false);

        expect(steps.at(3).props().text).toBe("Run model");
        expect(steps.at(3).props().active).toBe(false);
        expect(steps.at(3).props().number).toBe(4);
        expect(steps.at(3).props().complete).toBe(false);

        expect(steps.at(4).props().text).toBe("Review output");
        expect(steps.at(4).props().active).toBe(false);
        expect(steps.at(4).props().number).toBe(5);
        expect(steps.at(4).props().complete).toBe(false);
    });

    it("all steps except baseline are disabled initially", () => {
        const store = createSut();
        const wrapper = shallowMount(Stepper, {store, localVue});
        const steps = wrapper.findAll(Step);
        expect(steps.at(0).props().enabled).toBe(true);
        expect([1, 2, 3, 4].filter(i => steps.at(i).props().enabled).length).toBe(0);
    });

    it("upload surveys step is enabled when baseline step is complete", () => {
        const store = createSut({
            country: "testCountry",
            shape: mockShapeResponse(),
            population: mockPopulationResponse()
        });
        const wrapper = shallowMount(Stepper, {store, localVue});
        const steps = wrapper.findAll(Step);
        expect(steps.at(0).props().enabled).toBe(true);
        expect(steps.at(1).props().enabled).toBe(true);
        expect(steps.at(0).props().complete).toBe(true);
        expect([2, 3, 4].filter(i => steps.at(i).props().enabled).length).toBe(0);
    });

    it("updates active step when jump event is emitted", () => {
        const store = createSut({
            country: "testCountry",
            shape: mockShapeResponse(),
            population: mockPopulationResponse()
        });
        const wrapper = shallowMount(Stepper, {store, localVue});
        const steps = wrapper.findAll(Step);
        steps.at(1).vm.$emit("jump", 2);
        expect(steps.at(0).props().complete).toBe(true);
        expect(steps.at(1).props().active).toBe(true);
    });

    it("cannot continue when the active step is not complete", () => {
        const store = createSut({country: "", ready: true}, {ready: true});
        const wrapper = shallowMount(Stepper, {store, localVue});
        const continueLink = wrapper.find("#continue");
        expect(continueLink.classes()).toContain("disabled");

        continueLink.trigger("click");
        const steps = wrapper.findAll(Step);
        expect(steps.at(0).props().active).toBe(true);
    });


    it("can continue when the active step is complete", () => {
        const store = createSut({
            country: "testCountry",
            shape: mockShapeResponse(),
            population: mockPopulationResponse(),
            ready: true
        }, {ready: true});
        const wrapper = shallowMount(Stepper, {store, localVue});
        const continueLink = wrapper.find("#continue");
        expect(continueLink.classes()).not.toContain("disabled");

        continueLink.trigger("click");
        const steps = wrapper.findAll(Step);
        expect(steps.at(1).props().active).toBe(true);
    });

    it("updates from completed state when active step data is populated", (done) => {
        const baselineState = {country: "Malawi", population: mockPopulationResponse(), ready: true};
        const store = createSut(baselineState, {ready: true});
        const wrapper = shallowMount(Stepper, {store, localVue});
        const continueLink = wrapper.find("#continue");
        expect(continueLink.classes()).toContain("disabled");

        //invoke the mutation
        store.commit("baseline/ShapeUpdated", {
            "type": "ShapeUpdated",
            "payload": mockShapeResponse()
        });

        Vue.nextTick().then(() => {
            expect(wrapper.find("#continue").classes()).not.toContain("disabled");
            done();
        });
    });

    it("clears step from localStorage if all previous steps are not complete, once state becomes ready", async () => {
        const store = createSut({ready: true});
        const wrapper = shallowMount(Stepper, {store, localVue});

        await setActiveStepAndMakStateReady(store, wrapper);

        const steps = wrapper.findAll(Step);
        expect(steps.at(0).props().active).toBe(true);
        expect(!window.localStorage.getItem("activeStep")).toBe(true);
    });

    it("reloads step from localStorage if all previous steps are complete, once state becomes ready", async () => {

        const store = createSut({
            ready: true,
            country: "Malawi",
            shape: mockShapeResponse(),
            population: mockPopulationResponse()
        });
        const wrapper = shallowMount(Stepper, {store, localVue});

        await setActiveStepAndMakStateReady(store, wrapper);

        const steps = wrapper.findAll(Step);
        expect(steps.at(1).props().active).toBe(true);
    });

    it("saves step in localStorage on jump", async () => {

        const store = createSut({
            country: "testCountry",
            shape: mockShapeResponse(),
            population: mockPopulationResponse()
        });
        const wrapper = shallowMount(Stepper, {store, localVue});
        const steps = wrapper.findAll(Step);
        steps.at(1).vm.$emit("jump", 2);
        expect(window.localStorage.getItem("activeStep")).toBe("2");
    });

    async function setActiveStepAndMakStateReady(store: Store<any>, wrapper: Wrapper<any>) {

        window.localStorage.setItem("activeStep", "2");

        store.commit("surveyAndProgram/Ready", {
            "type": "Ready",
            "payload": true
        });

        await Vue.nextTick();
        expect(wrapper.findAll(LoadingSpinner).length).toBe(0);
    }

    it("model run step is not complete without success", () => {
        const store = createSut({}, {}, {success: false});
        const wrapper = shallowMount(Stepper, {store, localVue});
        const steps = wrapper.findAll(Step);
        expect(steps.at(3).props().complete).toBe(false);
    });

    it("model run step is complete on success", () => {
        const store = createSut({}, {}, {success: true});
        const wrapper = shallowMount(Stepper, {store, localVue});
        const steps = wrapper.findAll(Step);
        expect(steps.at(3).props().complete).toBe(true);
    });

});