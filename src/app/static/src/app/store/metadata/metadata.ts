import {Module} from 'vuex';
import {actions} from './actions';
import {mutations} from './mutations';
import {RootState} from "../../root";
import {PlottingMetadataResponse} from "../../generated";
import {localStorageManager} from "../../localStorageManager";
import {DataType} from "../filteredData/filteredData";

export interface MetadataState {
    plottingMetadataError: string
    plottingMetadata: PlottingMetadataResponse | null
}

export const initialMetadataState: MetadataState = {
    plottingMetadataError: "",
    plottingMetadata: null
};

export const metadataGetters = {
    complete: (state: MetadataState) => {
        return !!state.plottingMetadata
    },
    choroplethIndicatorsMetadata: (state: MetadataState,  getters: any, rootState: RootState, rootGetters: any) => {
        const selectedDataType = rootState.filteredData.selectedDataType;
        const plottingMetadata = state.plottingMetadata;

        if (!plottingMetadata) {
            return null;
        }

        let metadataForType = null;
        switch(selectedDataType) {
            case (DataType.ANC):
                metadataForType = plottingMetadata.anc;
                break;
            case (DataType.Program):
                metadataForType = plottingMetadata.programme;
                break;
            case (DataType.Survey):
                metadataForType = plottingMetadata.survey;
                break;
            case (DataType.Output):
                metadataForType = plottingMetadata.output;
                break;
        }

        if (metadataForType && metadataForType.choropleth) {
            return metadataForType.choropleth.indicators;
        }

        return null;
    }
};

const namespaced: boolean = true;
const existingState = localStorageManager.getState();

export const metadata: Module<MetadataState, RootState> = {
    namespaced,
    state: {...initialMetadataState, ...existingState && existingState.metadata},
    actions,
    mutations,
    getters: metadataGetters
};
