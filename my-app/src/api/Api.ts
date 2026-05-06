/* eslint-disable */
/* tslint:disable */
// @ts-nocheck
/*
 * ---------------------------------------------------------------
 * ## THIS FILE WAS GENERATED VIA SWAGGER-TYPESCRIPT-API        ##
 * ##                                                           ##
 * ## AUTHOR: acacode                                           ##
 * ## SOURCE: https://github.com/acacode/swagger-typescript-api ##
 * ---------------------------------------------------------------
 */

export interface AppLoginReq {
  login?: string;
  password?: string;
}

export interface AppLoginResp {
  accesstoken?: string;
  expiresin?: number;
  login?: string;
  tokentype?: string;
  username?: string;
}

export interface AppRegisterReq {
  login?: string;
  name?: string;
  pass?: string;
}

export interface AppRegisterResp {
  ok?: boolean;
}

export interface DsReagent {
  description?: string;
  formula?: string;
  id?: number;
  img?: string;
  name?: string;
  temperature?: number;
  video?: string;
}

export enum RoleRole {
  Researcher = "researcher",
  Professor = "professor",
  Admin = "admin",
}

export interface AppCompleteMethaneReq {
  status?: string;
}

export interface AppFormMethaneReq {
  methane_yield?: number;
  name?: string;
  temperature?: number;
}

export interface DsUser {
  email?: string;
  id?: number;
  is_professor?: boolean;
  login?: string;
  role?: RoleRole;
  username?: string;
  uuid?: string;
}

export interface DsMethaneReagent {
  methane_yield?: number;
  quantity?: number;
  reagent?: DsReagentDetails | null;
}

export interface DsReagentDetails {
  id?: number;
  name?: string;
  formula?: string;
  price?: number;
  img?: string;
  molarmass?: number;
}

export interface DsMethane {
  date_create?: string;
  date_finish?: string;
  date_update?: string;
  id?: number;
  name?: string;
  professor?: DsUser | null;
  reagents?: DsMethaneReagent[];
  researcher?: DsUser | null;
  status?: string;
  temperature?: number;
}

import type {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  HeadersDefaults,
  ResponseType,
} from "axios";
import axios from "axios";

export type QueryParamsType = Record<string | number, any>;

export interface FullRequestParams
  extends Omit<AxiosRequestConfig, "data" | "params" | "url" | "responseType"> {
  /** set parameter to `true` for call `securityWorker` for this request */
  secure?: boolean;
  /** request path */
  path: string;
  /** content type of request body */
  type?: ContentType;
  /** query params */
  query?: QueryParamsType;
  /** format of response (i.e. response.json() -> format: "json") */
  format?: ResponseType;
  /** request body */
  body?: unknown;
}

export type RequestParams = Omit<
  FullRequestParams,
  "body" | "method" | "query" | "path"
>;

export interface ApiConfig<SecurityDataType = unknown>
  extends Omit<AxiosRequestConfig, "data" | "cancelToken"> {
  securityWorker?: (
    securityData: SecurityDataType | null,
  ) => Promise<AxiosRequestConfig | void> | AxiosRequestConfig | void;
  secure?: boolean;
  format?: ResponseType;
}

export enum ContentType {
  Json = "application/json",
  JsonApi = "application/vnd.api+json",
  FormData = "multipart/form-data",
  UrlEncoded = "application/x-www-form-urlencoded",
  Text = "text/plain",
}

export class HttpClient<SecurityDataType = unknown> {
  public instance: AxiosInstance;
  private securityData: SecurityDataType | null = null;
  private securityWorker?: ApiConfig<SecurityDataType>["securityWorker"];
  private secure?: boolean;
  private format?: ResponseType;

  constructor({
    securityWorker,
    secure,
    format,
    ...axiosConfig
  }: ApiConfig<SecurityDataType> = {}) {
    this.instance = axios.create({
      ...axiosConfig,
      baseURL: axiosConfig.baseURL || "",
    });
    this.secure = secure;
    this.format = format;
    this.securityWorker = securityWorker;
  }

  public setSecurityData = (data: SecurityDataType | null) => {
    this.securityData = data;
  };

  protected mergeRequestParams(
    params1: AxiosRequestConfig,
    params2?: AxiosRequestConfig,
  ): AxiosRequestConfig {
    const method = params1.method || (params2 && params2.method);

    return {
      ...this.instance.defaults,
      ...params1,
      ...(params2 || {}),
      headers: {
        ...((method &&
          this.instance.defaults.headers[
            method.toLowerCase() as keyof HeadersDefaults
          ]) ||
          {}),
        ...(params1.headers || {}),
        ...((params2 && params2.headers) || {}),
      },
    };
  }

  protected stringifyFormItem(formItem: unknown) {
    if (typeof formItem === "object" && formItem !== null) {
      return JSON.stringify(formItem);
    } else {
      return `${formItem}`;
    }
  }

  protected createFormData(input: Record<string, unknown>): FormData {
    if (input instanceof FormData) {
      return input;
    }
    return Object.keys(input || {}).reduce((formData, key) => {
      const property = input[key];
      const propertyContent: any[] =
        property instanceof Array ? property : [property];

      for (const formItem of propertyContent) {
        const isFileType = formItem instanceof Blob || formItem instanceof File;
        formData.append(
          key,
          isFileType ? formItem : this.stringifyFormItem(formItem),
        );
      }

      return formData;
    }, new FormData());
  }

  public request = async <T = any, _E = any>({
    secure,
    path,
    type,
    query,
    format,
    body,
    ...params
  }: FullRequestParams): Promise<AxiosResponse<T>> => {
    const secureParams =
      ((typeof secure === "boolean" ? secure : this.secure) &&
        this.securityWorker &&
        (await this.securityWorker(this.securityData))) ||
      {};
    const requestParams = this.mergeRequestParams(params, secureParams);
    const responseFormat = format || this.format || undefined;

    if (
      type === ContentType.FormData &&
      body &&
      body !== null &&
      typeof body === "object"
    ) {
      body = this.createFormData(body as Record<string, unknown>);
    }

    if (
      type === ContentType.Text &&
      body &&
      body !== null &&
      typeof body !== "string"
    ) {
      body = JSON.stringify(body);
    }

    return this.instance.request({
      ...requestParams,
      headers: {
        ...(requestParams.headers || {}),
        ...(type ? { "Content-Type": type } : {}),
      },
      params: query,
      responseType: responseFormat,
      data: body,
      url: path,
    });
  };
}

/**
 * @title Lab4 API
 * @version 1.0
 * @license AS IS
 * @contact API Support
 *
 * API with JWT Auth
 */
export class Api<
  SecurityDataType extends unknown,
> extends HttpClient<SecurityDataType> {
  api = {
    /**
     * @description Публичный метод чтения данных
     *
     * @tags reagents
     * @name ReagentsList
     * @summary Список реагентов
     * @request GET:/api/reagents
     */
    reagentsList: (
      query?: {
        /** Поиск */
        search?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<DsReagent[], Record<string, any>>({
        path: `/api/reagents`,
        method: "GET",
        query: query,
        format: "json",
        ...params,
      }),

    /**
     * @description Для исследователя возвращает только его заявки, для модератора и администратора — все
     *
     * @tags methanes
     * @name MethanesList
     * @summary Список заявок
     * @request GET:/api/methanes
     * @secure
     */
    methanesList: (params: RequestParams = {}) =>
      this.request<DsMethane[], Record<string, any>>({
        path: `/api/methanes`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Получить заявку по ID
     *
     * @tags methanes
     * @name MethanesDetail
     * @summary Получить заявку по ID
     * @request GET:/api/methanes/{id}
     * @secure
     */
    methanesDetail: (id: number, params: RequestParams = {}) =>
      this.request<DsMethane, Record<string, any>>({
        path: `/api/methanes/${id}`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Получить черновик текущего пользователя
     *
     * @tags methanes
     * @name MethanesDraftList
     * @summary Получить черновик текущего пользователя
     * @request GET:/api/methanes/draft
     * @secure
     */
    methanesDraftList: (params: RequestParams = {}) =>
      this.request<DsMethane, Record<string, any>>({
        path: `/api/methanes/draft`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Создаёт новую заявку и назначает текущего пользователя автором
     *
     * @tags methanes
     * @name MethanesDraftCreate
     * @summary Создать черновик заявки
     * @request POST:/api/methanes/draft
     * @secure
     */
    methanesDraftCreate: (params: RequestParams = {}) =>
      this.request<DsMethane, Record<string, any>>({
        path: `/api/methanes/draft`,
        method: "POST",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * @description Только владелец заявки может перевести её из черновика в статус "сформирована"
     *
     * @tags methanes
     * @name MethanesFormUpdate
     * @summary Сформировать заявку
     * @request PUT:/api/methanes/{id}/form
     * @secure
     */
    methanesFormUpdate: (
      id: number,
      input: AppFormMethaneReq,
      params: RequestParams = {},
    ) =>
      this.request<Record<string, any>, Record<string, any>>({
        path: `/api/methanes/${id}/form`,
        method: "PUT",
        body: input,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description Только модератор или администратор может завершить сформированную заявку
     *
     * @tags methanes
     * @name MethanesCompleteUpdate
     * @summary Завершить или отклонить заявку
     * @request PUT:/api/methanes/{id}/complete
     * @secure
     */
    methanesCompleteUpdate: (
      id: number,
      input: AppCompleteMethaneReq,
      params: RequestParams = {},
    ) =>
      this.request<Record<string, any>, Record<string, any>>({
        path: `/api/methanes/${id}/complete`,
        method: "PUT",
        body: input,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),
  };
  auth = {
    /**
     * @description JWT, accesstoken
     *
     * @tags auth
     * @name LoginCreate
     * @summary JWT
     * @request POST:/auth/login
     */
    loginCreate: (input: AppLoginReq, params: RequestParams = {}) =>
      this.request<AppLoginResp, Record<string, any>>({
        path: `/auth/login`,
        method: "POST",
        body: input,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * @description JWT blacklist Redis
     *
     * @tags auth
     * @name LogoutCreate
     * @summary Blacklist JWT
     * @request POST:/auth/logout
     * @secure
     */
    logoutCreate: (params: RequestParams = {}) =>
      this.request<Record<string, any>, Record<string, any>>({
        path: `/auth/logout`,
        method: "POST",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags auth
     * @name RegisterCreate
     * @request POST:/auth/register
     */
    registerCreate: (input: AppRegisterReq, params: RequestParams = {}) =>
      this.request<AppRegisterResp, Record<string, any>>({
        path: `/auth/register`,
        method: "POST",
        body: input,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),
  };
}
