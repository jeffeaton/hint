import Vuex from "vuex";
import {mount, Wrapper} from '@vue/test-utils';
import FileUpload from "../../../app/components/files/FileUpload.vue";
import ResetConfirmation from "../../../app/components/ResetConfirmation.vue";
import {mockFile} from "../../mocks";
import {emptyState} from "../../../app/root";
import registerTranslations from "../../../app/store/translations/registerTranslations";

declare let currentUser: string;
currentUser = "guest";

describe("File upload component", () => {

    const mockGetters = {
        editsRequireConfirmation: () => true,
        laterCompleteSteps: () => [{number: 4, textKey: "runModel"}]
    };

    const createStore = () => {
        const store = new Vuex.Store({
            state: emptyState(),
            modules: {
                stepper: {
                    namespaced: true,
                    getters: mockGetters
                },
                projects: {
                    namespaced: true
                },
                errors:  {
                    namespaced: true
                }
            }
        });
        registerTranslations(store);
        return store;
    };

    const createSut = (props?: any) => {
        return mount(FileUpload, {
            store: createStore(),
            propsData: {
                upload: jest.fn(),
                name: "pjnz",
                accept: "csv",
                ...props
            }
        });
    };

    const testFile = mockFile("TEST FILE NAME", "TEST CONTENTS");

    function uploadConfirmationModal(wrapper: Wrapper<FileUpload>) {
        return wrapper.findAll(ResetConfirmation).at(0)
    }

    it("opens confirmation modal when new file is selected", () => {
        const wrapper = createSut();
        (wrapper.vm.$refs as any).pjnz = {
            files: [testFile]
        };
        (wrapper.vm as any).handleFileSelect();
        expect(uploadConfirmationModal(wrapper).props("open")).toBe(true);
    });

    it("uploads file if user confirms edit", (done) => {
        const uploader = jest.fn();
        const wrapper = createSut({
            upload: uploader
        });

        (wrapper.vm.$refs as any).pjnz = {
            files: [testFile]
        };

        (wrapper.vm as any).handleFileSelect();
        uploadConfirmationModal(wrapper).find(".btn-white").trigger("click");

        setTimeout(() => {
            expect(uploader.mock.calls.length).toBe(1);
            expect(uploadConfirmationModal(wrapper).props("open")).toBe(false);
            done();
        });
    });

    it("does not upload file if user cancels edit", (done) => {
        const uploader = jest.fn();
        const wrapper = createSut({
            upload: uploader
        });

        (wrapper.vm.$refs as any).pjnz = {
            files: [testFile]
        };

        (wrapper.vm as any).handleFileSelect();
        uploadConfirmationModal(wrapper).find(".btn-red").trigger("click");

        setTimeout(() => {
            expect(uploader.mock.calls.length).toBe(0);
            expect(uploadConfirmationModal(wrapper).props("open")).toBe(false);
            done();
        });
    });

});
