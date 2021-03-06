import {MutationTree} from "vuex";
import {initialModelRunState, maxPollErrors, ModelRunState} from "./modelRun";
import {PayloadWithType} from "../../types";
import {ModelResultResponse, ModelStatusResponse, ModelSubmitResponse, Error} from "../../generated";

export enum ModelRunMutation {
    ModelRunStarted = "ModelRunStarted",
    ModelRunError = "ModelRunError",
    RunStatusUpdated = "RunStatusUpdated",
    PollingForStatusStarted = "PollingForStatusStarted",
    RunResultFetched = "RunResultFetched",
    RunResultError = "RunResultError",
    RunStatusError = "RunStatusError",
    RunCancelled = "RunCancelled",
    Ready = "Ready"
}

export const mutations: MutationTree<ModelRunState> = {
    [ModelRunMutation.ModelRunStarted](state: ModelRunState, action: PayloadWithType<ModelSubmitResponse>) {
        state.modelRunId = action.payload.id;
        state.status = {id: action.payload.id} as ModelStatusResponse;
        state.errors = [];
    },

    [ModelRunMutation.RunStatusUpdated](state: ModelRunState, action: PayloadWithType<ModelStatusResponse>) {
        if (action.payload.done) {
            stopPolling(state);
        }
        state.status = action.payload;
        state.errors = [];
    },

    [ModelRunMutation.PollingForStatusStarted](state: ModelRunState, action: PayloadWithType<number>) {
        state.statusPollId = action.payload;
    },

    [ModelRunMutation.RunResultFetched](state: ModelRunState, action: PayloadWithType<ModelResultResponse>) {
        state.result = action.payload;
    },

    [ModelRunMutation.RunResultError](state: ModelRunState, action: PayloadWithType<Error>) {
        state.errors.push(action.payload);
    },

    [ModelRunMutation.Ready](state: ModelRunState) {
        state.ready = true;
    },

    [ModelRunMutation.ModelRunError](state: ModelRunState, action: PayloadWithType<Error>) {
        state.errors.push(action.payload);
    },

    [ModelRunMutation.RunStatusError](state: ModelRunState, action: PayloadWithType<Error>) {
        state.errors.push(action.payload);
        if (state.errors.length >= maxPollErrors) {
            stopPolling(state);
            state.status = {} as ModelStatusResponse;
            state.modelRunId = "";
            state.errors.push({
                error: "Unable to retrieve model run status. Please retry the model run, or contact support if the error persists.",
                detail: null
            });
        }
    },

    [ModelRunMutation.RunCancelled](state: ModelRunState) {
        stopPolling(state);
        Object.assign(state, initialModelRunState());
        state.ready = true;
    }
};

const stopPolling = (state: ModelRunState) => {
    clearInterval(state.statusPollId);
    state.statusPollId = -1;
};


