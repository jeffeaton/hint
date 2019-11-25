import axios, {AxiosError, AxiosResponse} from "axios";
import {
<<<<<<< HEAD
    Response,
=======
    AncResponse,
    ModelResultResponse,
    ModelStatusResponse,
    ModelSubmitResponse,
    PjnzResponse,
    PopulationResponse,
    ProgrammeResponse,
    Response, SessionFile,
    ShapeResponse,
    SurveyResponse, ValidateBaselineResponse,
    ValidateInputResponse
>>>>>>> master
} from "./generated";
import {Commit} from "vuex";
import {freezer, isHINTResponse} from "./utils";

<<<<<<< HEAD
=======
import {ErrorsMutation} from "./store/errors/mutations";
import {Dict, LocalSessionFile} from "./types";

>>>>>>> master
declare var appUrl: string;

export interface ResponseWithType<T> extends Response {
    data: T
}

export interface API<S, E> {

    withError: (type: E) => API<S, E>
    withSuccess: (type: S) => API<S, E>
    ignoreErrors: () => API<S, E>

<<<<<<< HEAD
    postAndReturn<T>(url: string, data: any): Promise<void | ResponseWithType<T>>

    get<T>(url: string): Promise<void | ResponseWithType<T>>
=======
    postAndReturn<T>(url: string, data: any): Promise<void | T>

    get<T>(url: string): Promise<void | T>
>>>>>>> master
    delete(url: string): Promise<void | true>
}

export class APIService<S extends string, E extends string> implements API<S, E> {

    private readonly _commit: Commit;

    constructor(commit: Commit) {
        this._commit = commit
    }

    // appUrl will be set as a jest global during testing
    private readonly _baseUrl = typeof appUrl !== "undefined" ? appUrl : "";

    private _buildFullUrl = (url: string) => {
        return this._baseUrl + url
    };

    private _ignoreErrors: Boolean = false;
    private _freezeResponse: Boolean = false;

    static getFirstErrorFromFailure = (failure: Response) => {
        if (failure.errors.length == 0){
            return "Unknown error"
        }
        const firstError = failure.errors[0];
        return firstError.detail ? firstError.detail : firstError.error;
    };

    private _onError: ((failure: Response) => void) | null = null;

    private _onSuccess: ((success: Response) => void) | null = null;

    freezeResponse = () => {
        this._freezeResponse = true;
        return this;
    };

    withError = (type: E) => {
        this._onError = (failure: Response) => {
            this._commit({type: type, payload: APIService.getFirstErrorFromFailure(failure)});
        };
        return this
    };

    ignoreErrors = () => {
        this._ignoreErrors = true;
        return this;
    };

    withSuccess = (type: S) => {
        this._onSuccess = (data: any) => {
            const finalData = this._freezeResponse ? freezer.deepFreeze(data) : data;
            this._commit({type: type, payload: finalData});
        };
        return this;
    };

    private _handleAxiosResponse(promise: Promise<AxiosResponse>) {
        return promise.then((axioxResponse: AxiosResponse) => {
            const success = axioxResponse && axioxResponse.data;
            const data = success.data;
            if (this._onSuccess) {
                this._onSuccess(data);
            }
            return axioxResponse.data;
        }).catch((e: AxiosError) => {
            return this._handleError(e)
        });
    }

    private _handleError = (e: AxiosError) => {
        console.log(e.response && e.response.data || e);
        if (this._ignoreErrors) {
            return
        }
        const failure = e.response && e.response.data;
        if (!isHINTResponse(failure)) {
            throw new Error("Could not parse API response");
        }
        else if (this._onError) {
            this._onError(failure);
        } else {
            this._addErrorToStore(APIService.getFirstErrorFromFailure(failure));
        }
    };

    private  _addErrorToStore = (error: string) => {
        this._commit({type: `errors/${ErrorsMutation.ErrorAdded}`, payload: error}, {root: true});
    };

    private _verifyHandlers(url: string) {
        if (this._onError == null && !this._ignoreErrors) {
            console.warn(`No error handler registered for request ${url}.`)
        }
        if (this._onSuccess == null) {
            console.warn(`No success handler registered for request ${url}.`)
        }
    }

<<<<<<< HEAD
    async get<T>(url: string): Promise<void | ResponseWithType<T>> {
=======
    async get<T>(url: string): Promise<void | T> {
>>>>>>> master
        this._verifyHandlers(url);
        const fullUrl = this._buildFullUrl(url);
        return this._handleAxiosResponse(axios.get(fullUrl));
    }

<<<<<<< HEAD
    async postAndReturn<T>(url: string, data: any): Promise<void | ResponseWithType<T>> {
=======
    async postAndReturn<T>(url: string, data: any): Promise<void | T> {
>>>>>>> master
        this._verifyHandlers(url);
        const fullUrl = this._buildFullUrl(url);

        // this allows us to pass data of type FormData in both the browser and
        // in node for testing, using the "form-data" package in the latter case
        const config = typeof data.getHeaders == "function" ? {
            headers: data.getHeaders()
        } : {};

        return this._handleAxiosResponse(axios.post(fullUrl, data, config));
    }

    async delete(url: string) {
        const fullUrl = this._buildFullUrl(url);
        return this._handleAxiosResponse(axios.delete(fullUrl));
    }

}

export const api = <S extends string, E extends string>(commit: Commit) => new APIService<S, E>(commit);
