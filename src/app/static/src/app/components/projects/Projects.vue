<template>
    <div>
        <div v-if="!loading" id="projects-content" class="row">
            <div id="projects-header" class="lead col-12">
                <span v-translate="'projectsHeaderCreate'"></span>
                <span v-if="currentProject">
                    <span v-translate="'or'"></span>
                    <a v-translate="'projectsHeaderReturn'"
                       href="#" @click="handleCurrentProjectClick"></a> ({{currentProject.name}})
                </span>
            </div>
            <div class="my-3 col-6 clearfix">
                <input type="text" class="form-control" v-translate:placeholder="'projectName'" v-model="newProjectName">
                <button type="button"
                        class="btn btn-red mt-2 float-right"
                        :disabled="disableCreate"
                        @click="createProject(newProjectName)"
                        v-translate="'createProject'">
                </button>
            </div>
            <div class="my-3 col-12">
                <project-history :projects="previousProjects"></project-history>
            </div>
            <error-alert v-if="hasError" :error="error"></error-alert>
        </div>
        <div v-if="loading" class="text-center">
            <loading-spinner size="lg"></loading-spinner>
            <h2 id="loading-message" v-translate="'loadingProject'"></h2>
        </div>
    </div>
</template>

<script lang="ts">
    import Vue from "vue";
    import {mapActionByName, mapStateProps} from "../../utils";
    import {ProjectsState} from "../../store/projects/projects";
    import {Error} from "../../generated";
    import ErrorAlert from "../ErrorAlert.vue";
    import LoadingSpinner from "../LoadingSpinner.vue";
    import {Project} from "../../types";
    import ProjectHistory from "./ProjectHistory.vue";

    const namespace = "projects";

    interface Data {
        newProjectName: string
    }

    interface Computed {
        currentProject: Project | null,
        previousProjects: Project[],
        error: Error,
        hasError: boolean,
        disableCreate: boolean,
        loading: boolean
    }

    interface Methods {
        createProject: (name: string) => void,
        getProjects: () => void,
        handleCurrentProjectClick: (e: Event) => void
    }

    export default Vue.extend<Data, Methods, Computed, {}>({
        data: function(){
            return {
                newProjectName: ""
            }
        },
        computed: {
            ...mapStateProps<ProjectsState, keyof Computed>(namespace, {
                currentProject: state => state.currentProject,
                previousProjects: state => state.previousProjects,
                error: state => state.error,
                hasError: state => !!state.error,
                loading: state => state.loading
            }),
            disableCreate: function() {
                return !this.newProjectName;
            }
        },
        methods: {
            handleCurrentProjectClick: function(e: Event) {
                e.preventDefault();
                this.$router.push('/');
            },
            createProject: mapActionByName(namespace, "createProject"),
            getProjects: mapActionByName(namespace, "getProjects")
        },
        mounted() {
            this.getProjects();
        },
        components: {
            ErrorAlert,
            LoadingSpinner,
            ProjectHistory
        }
    });
</script>