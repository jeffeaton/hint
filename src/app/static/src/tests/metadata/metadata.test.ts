import {metadataGetters} from "../../app/store/metadata/metadata"
import {DataType} from "../../app/store/filteredData/filteredData";
import {mockFilteredDataState, mockMetadataState, mockPlottingMetadataResponse, mockRootState} from "../mocks";

function testGetsChoroplethIndicatorsMetadataForDataType(dataType: DataType) {
    const testIndicators = {
        art_coverage: {name: "ART Coverage"},
        prevalence: {name: "Prevalence"}
    };

    const testChoroMetadata = {
        choropleth: {
            indicators: testIndicators
        }
    } as any;

    let metadataProps = null as any;
    switch(dataType) {
        case(DataType.ANC):
            metadataProps = {anc: testChoroMetadata};
            break;
        case(DataType.Survey):
            metadataProps = {survey: testChoroMetadata};
            break;
        case(DataType.Program):
            metadataProps = {programme: testChoroMetadata};
            break;
        case(DataType.Output):
            metadataProps = {output: testChoroMetadata};
            break;
    }

    const metadataState =  mockMetadataState(
        {plottingMetadata: mockPlottingMetadataResponse(metadataProps)});

    const rootState = mockRootState({filteredData: mockFilteredDataState({selectedDataType: dataType})});

    const result = metadataGetters.choroplethIndicatorsMetadata(metadataState, null, rootState, null);

    expect(result).toStrictEqual(testIndicators);
}

describe("Metadata regionIndicator getter", () => {

    it("gets choropleth indicators metadata for anc", () => {
        testGetsChoroplethIndicatorsMetadataForDataType(DataType.ANC);
    });

    it("gets choropleth indicators metadata for programme", () => {
        testGetsChoroplethIndicatorsMetadataForDataType(DataType.Program);
    });

    it("gets choropleth indicators metadata for survey", () => {
        testGetsChoroplethIndicatorsMetadataForDataType(DataType.Survey);
    });

    it("gets choropleth indicators metadata for output", () => {
        testGetsChoroplethIndicatorsMetadataForDataType(DataType.Output);
    });

    it ("gets null choropleth indicators when there is no metadata", () => {
        const metadataState =  mockMetadataState(
            {plottingMetadata: null});

        const result = metadataGetters.choroplethIndicatorsMetadata(metadataState, null, mockRootState(), null);

        expect(result).toBeNull();
    });
});