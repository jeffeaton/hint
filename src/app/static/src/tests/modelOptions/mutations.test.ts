import {mockModelOptionsState} from "../mocks";
import {ModelOptionsMutation, mutations} from "../../app/store/modelOptions/mutations";
import {DynamicFormMeta, NumberControl} from "../../app/components/forms/types";


describe("Model run options mutations", () => {

    it("validates and saves options", () => {
        const state = mockModelOptionsState();
        mutations[ModelOptionsMutation.Validate](state, {"test": 123});
        expect(state.valid).toBe(true);
        expect(state.options).toStrictEqual({"test": 123});
    });

    it("updates form", () => {
        const state = mockModelOptionsState();
        const mockForm: DynamicFormMeta = {
            controlSections: [
                {
                    label: "l1",
                    controlGroups: []
                }
            ]
        };
        mutations[ModelOptionsMutation.Update](state, mockForm);
        expect(state.optionsFormMeta).toStrictEqual(mockForm);
    });

    const mockControl: NumberControl = {
        name: "i1",
        type: "number",
        required: true
    };

    it("updates form without overwriting existing form control values and sets fetching to false", () => {

        const state = mockModelOptionsState({
            fetching: true, optionsFormMeta: {
                controlSections: [
                    {
                        label: "general",
                        controlGroups: [
                            {
                                label: "g1",
                                controls: [{...mockControl, value: 10}]
                            },
                            {
                                label: "g2",
                                controls: [{...mockControl, value: 10}]
                            }
                        ]
                    }
                ]
            }
        });

        const newForm: DynamicFormMeta = {
            controlSections: [
                {
                    label: "general",
                    controlGroups: [
                        {
                            label: "g1",
                            controls: [
                                {...mockControl},
                                {...mockControl, name: "new_control"}
                            ]
                        },
                        {
                            label: "new_group",
                            controls: [{...mockControl}]
                        }
                    ]
                },
                {
                    label: "survey",
                    controlGroups: [
                        {
                            label: "g2",
                            controls: []
                        }
                    ]
                }
            ]
        };

        const expected: DynamicFormMeta = {
            controlSections: [
                {
                    label: "general",
                    controlGroups: [
                        {
                            label: "g1",
                            controls: [
                                {...mockControl, value: 10},
                                {...mockControl, name: "new_control"}
                            ]
                        }, {
                            label: "new_group",
                            controls: [{...mockControl}]
                        }
                    ]
                },
                {
                    label: "survey",
                    controlGroups: [
                        {
                            label: "g2",
                            controls: []
                        }
                    ]
                }
            ]
        };
        mutations.ModelOptionsFetched(state, {payload: newForm});
        expect(state.optionsFormMeta).toStrictEqual(expected);
        expect(state.fetching).toBe(false);
    });

    it("sets fetching to true", () => {
        const state = mockModelOptionsState();
        mutations.FetchingModelOptions(state);
        expect(state.fetching).toBe(true);
    })

});
