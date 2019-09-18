import {Module} from 'vuex';
import {actions} from './actions';
import {mutations} from './mutations';
import {InputState, RootState} from "../../root";
import {PopulationResponse, ShapeResponse} from "../../generated";

export interface BaselineState extends InputState {
    pjnzError: string
    country: string
    pjnzFilename: string
    shape: ShapeResponse | null
    shapeError: string
    population: PopulationResponse | null,
    populationError: string
}

export const initialBaselineState: BaselineState = {
    country: "",
    pjnzError: "",
    pjnzFilename: "",
    shape: null,
    shapeError: "",
    population: null,
    populationError: "",
    ready: false
};

export const baselineGetters = {
  complete: (state: BaselineState) => {
      return !!state.country && !!state.shape && !!state.population
  }
};

const getters = baselineGetters;

const namespaced: boolean = true;

export const baseline: Module<BaselineState, RootState> = {
    namespaced,
    state: initialBaselineState,
    getters,
    actions,
    mutations
};
