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

export interface Login2A {
  /**
   * Username
   * @minLength 1
   */
  username: string;
  /**
   * Password
   * @minLength 1
   */
  password: string;
}

export interface PayloadCalculation {
  /** ID */
  pk?: number;
  /** Status */
  status?:
    | "Черновик"
    | "Удален"
    | "В расчете"
    | "Расчет завершен"
    | "Ошибка в расчете";
  /** Комментарий */
  comment?: string | null;
  /**
   * Широта космодрома
   * @min -9223372036854776000
   * @max 9223372036854776000
   */
  location?: number | null;
  /**
   * Порт
   * @maxLength 100
   */
  port_name?: string | null;
  /**
   * Creation datetime
   * @format date-time
   */
  creation_datetime?: string;
  /**
   * Formation datetime
   * @format date-time
   */
  formation_datetime?: string | null;
  /**
   * Completion datetime
   * @format date-time
   */
  completion_datetime?: string | null;
  /** Client */
  client: number;
  /** Manager */
  manager?: number | null;
  /** User */
  user?: string;
}

export interface UserLogin {
  /**
   * Username
   * @minLength 1
   */
  username: string;
  /**
   * Password
   * @minLength 1
   */
  password: string;
}

export interface UserRegister {
  /** ID */
  id?: number;
  /**
   * Email address
   * @format email
   * @maxLength 254
   */
  email?: string;
  /**
   * Password
   * @minLength 1
   * @maxLength 128
   */
  password: string;
  /**
   * Username
   * Required. 150 characters or fewer. Letters, digits and @/./+/-/_ only.
   * @minLength 1
   * @maxLength 150
   * @pattern ^[\w.@+-]+$
   */
  username: string;
}

export interface User {
  /** ID */
  id?: number;
  /**
   * Email address
   * @format email
   * @maxLength 254
   */
  email?: string;
  /**
   * Username
   * Required. 150 characters or fewer. Letters, digits and @/./+/-/_ only.
   * @minLength 1
   * @maxLength 150
   * @pattern ^[\w.@+-]+$
   */
  username: string;
}

export interface Verify2ACode {
  /**
   * Code
   * @minLength 6
   * @maxLength 6
   */
  code: string;
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
      baseURL: axiosConfig.baseURL || "http://localhost:8000/api",
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
 * @title Payload Calculator
 * @version v1
 * @license BSD License
 * @termsOfService https://www.google.com/policies/terms/
 * @baseUrl http://localhost:8000/api
 * @contact <contact@artifacts.local>
 *
 * API для расчета полезной нагрузки
 */
export class Api<
  SecurityDataType extends unknown,
> extends HttpClient<SecurityDataType> {
  launchvehicle = {
    /**
     * No description
     *
     * @tags launchvehicle
     * @name LaunchvehicleList
     * @request GET:/launchvehicle/
     * @secure
     */
    launchvehicleList: (params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/launchvehicle/`,
        method: "GET",
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags launchvehicle
     * @name LaunchvehicleCreate
     * @request POST:/launchvehicle/
     * @secure
     */
    launchvehicleCreate: (params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/launchvehicle/`,
        method: "POST",
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags launchvehicle
     * @name LaunchvehicleCreateCreate
     * @request POST:/launchvehicle/create/
     * @secure
     */
    launchvehicleCreateCreate: (params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/launchvehicle/create/`,
        method: "POST",
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags launchvehicle
     * @name LaunchvehicleRead
     * @request GET:/launchvehicle/{id}/
     * @secure
     */
    launchvehicleRead: (id: string, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/launchvehicle/${id}/`,
        method: "GET",
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags launchvehicle
     * @name LaunchvehicleUpdate
     * @request PUT:/launchvehicle/{id}/
     * @secure
     */
    launchvehicleUpdate: (id: string, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/launchvehicle/${id}/`,
        method: "PUT",
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags launchvehicle
     * @name LaunchvehicleDelete
     * @request DELETE:/launchvehicle/{id}/
     * @secure
     */
    launchvehicleDelete: (id: string, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/launchvehicle/${id}/`,
        method: "DELETE",
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags launchvehicle
     * @name LaunchvehiclePutUpdate
     * @request PUT:/launchvehicle/{id}/put/
     * @secure
     */
    launchvehiclePutUpdate: (id: string, params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/launchvehicle/${id}/put/`,
        method: "PUT",
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags launchvehicle
     * @name LaunchvehicleAddToCalculationCreate
     * @request POST:/launchvehicle/{rocket_id}/add_to_calculation/
     * @secure
     */
    launchvehicleAddToCalculationCreate: (
      rocketId: string,
      params: RequestParams = {},
    ) =>
      this.request<void, any>({
        path: `/launchvehicle/${rocketId}/add_to_calculation/`,
        method: "POST",
        secure: true,
        ...params,
      }),
  };
  login2A = {
    /**
     * @description Вход в систему с поддержкой 2FA
     *
     * @tags login2a
     * @name Login2ACreate
     * @request POST:/login2a/
     * @secure
     */
    login2ACreate: (data: Login2A, params: RequestParams = {}) =>
      this.request<
        {
          token?: string;
          user?: {
            id?: number;
            username?: string;
            email?: string;
          };
          requires_2fa?: boolean;
          message?: string;
          email?: string;
        },
        void
      >({
        path: `/login2a/`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),
  };
  mm = {
    /**
     * No description
     *
     * @tags mm
     * @name MmPayloadcalculationUpdateRocketUpdate
     * @request PUT:/mm/payloadcalculation/{calculation_id}/update_rocket/{rocket_id}/
     * @secure
     */
    mmPayloadcalculationUpdateRocketUpdate: (
      calculationId: string,
      rocketId: string,
      params: RequestParams = {},
    ) =>
      this.request<void, any>({
        path: `/mm/payloadcalculation/${calculationId}/update_rocket/${rocketId}/`,
        method: "PUT",
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags mm
     * @name MmPayloadcalculationDeleteRocketDelete
     * @request DELETE:/mm/payloadcalculation/{payload_calculation_id}/delete_rocket/{rocket_id}/
     * @secure
     */
    mmPayloadcalculationDeleteRocketDelete: (
      payloadCalculationId: string,
      rocketId: string,
      params: RequestParams = {},
    ) =>
      this.request<void, any>({
        path: `/mm/payloadcalculation/${payloadCalculationId}/delete_rocket/${rocketId}/`,
        method: "DELETE",
        secure: true,
        ...params,
      }),
  };
  payloadcalculation = {
    /**
     * No description
     *
     * @tags payloadcalculation
     * @name PayloadcalculationList
     * @request GET:/payloadcalculation/
     * @secure
     */
    payloadcalculationList: (params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/payloadcalculation/`,
        method: "GET",
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags payloadcalculation
     * @name PayloadcalculationBasketCntCalkList
     * @request GET:/payloadcalculation/basket_cnt_calk/
     * @secure
     */
    payloadcalculationBasketCntCalkList: (params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/payloadcalculation/basket_cnt_calk/`,
        method: "GET",
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags payloadcalculation
     * @name PayloadcalculationRead
     * @request GET:/payloadcalculation/{calculation_id}/
     * @secure
     */
    payloadcalculationRead: (
      calculationId: string,
      params: RequestParams = {},
    ) =>
      this.request<void, any>({
        path: `/payloadcalculation/${calculationId}/`,
        method: "GET",
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags payloadcalculation
     * @name PayloadcalculationDeleteDelete
     * @request DELETE:/payloadcalculation/{calculation_id}/delete/
     * @secure
     */
    payloadcalculationDeleteDelete: (
      calculationId: string,
      params: RequestParams = {},
    ) =>
      this.request<void, any>({
        path: `/payloadcalculation/${calculationId}/delete/`,
        method: "DELETE",
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags payloadcalculation
     * @name PayloadcalculationUpdateUpdate
     * @request PUT:/payloadcalculation/{calculation_id}/update/
     * @secure
     */
    payloadcalculationUpdateUpdate: (
      calculationId: string,
      data: PayloadCalculation,
      params: RequestParams = {},
    ) =>
      this.request<PayloadCalculation, any>({
        path: `/payloadcalculation/${calculationId}/update/`,
        method: "PUT",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags payloadcalculation
     * @name PayloadcalculationUpdateStatusAdminUpdate
     * @request PUT:/payloadcalculation/{calculation_id}/update_status_admin/
     * @secure
     */
    payloadcalculationUpdateStatusAdminUpdate: (
      calculationId: string,
      params: RequestParams = {},
    ) =>
      this.request<void, any>({
        path: `/payloadcalculation/${calculationId}/update_status_admin/`,
        method: "PUT",
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags payloadcalculation
     * @name PayloadcalculationUpdateStatusUserUpdate
     * @request PUT:/payloadcalculation/{calculation_id}/update_status_user/
     * @secure
     */
    payloadcalculationUpdateStatusUserUpdate: (
      calculationId: string,
      data: UpdateStatusPayload,
      params: RequestParams = {},
    ) =>
      this.request<void, any>({
        path: `/payloadcalculation/${calculationId}/update_status_user/`,
        method: "PUT",
        secure: true,
        body: data, // Добавляем тело запроса
        ...params,
      }),
  };
  users = {
    /**
     * No description
     *
     * @tags users
     * @name UsersList
     * @request GET:/users/
     * @secure
     */
    usersList: (params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/users/`,
        method: "GET",
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags users
     * @name UsersLoginCreate
     * @request POST:/users/login/
     * @secure
     */
    usersLoginCreate: (data: UserLogin, params: RequestParams = {}) =>
      this.request<UserLogin, any>({
        path: `/users/login/`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags users
     * @name UsersLogoutCreate
     * @request POST:/users/logout/
     * @secure
     */
    usersLogoutCreate: (params: RequestParams = {}) =>
      this.request<void, any>({
        path: `/users/logout/`,
        method: "POST",
        secure: true,
        ...params,
      }),

    /**
     * No description
     *
     * @tags users
     * @name UsersRegisterCreate
     * @request POST:/users/register/
     * @secure
     */
    usersRegisterCreate: (data: UserRegister, params: RequestParams = {}) =>
      this.request<UserRegister, any>({
        path: `/users/register/`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
     * No description
     *
     * @tags users
     * @name UsersUpdateUpdate
     * @request PUT:/users/{user_id}/update/
     * @secure
     */
    usersUpdateUpdate: (
      userId: string,
      data: User,
      params: RequestParams = {},
    ) =>
      this.request<User, any>({
        path: `/users/${userId}/update/`,
        method: "PUT",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),
  };
  verifyCode = {
    /**
     * @description Проверяет код двухфакторной аутентификации, отправленный на email пользователя. **Требования:** - Пользователь должен предварительно пройти первый этап аутентификации через /api/login2a/ - Код должен быть получен на email пользователя - Код действителен в течение 10 минут **Процесс работы:** 1. Пользователь вводит код из email 2. Система проверяет код на валидность 3. При успешной проверке создается сессия 4. Возвращается токен сессии для последующих запросов
     *
     * @tags Аутентификация
     * @name Verify2FaCode
     * @summary Подтверждение кода 2FA
     * @request POST:/verify-code/
     */
    verify2FaCode: (data: Verify2ACode, params: RequestParams = {}) =>
      this.request<
        {
          /** Токен сессии для аутентификации */
          session_token?: string;
          /** Информация о пользователе */
          user?: {
            id?: number;
            username?: string;
            email?: string;
            first_name?: string;
            last_name?: string;
          };
          /** Сообщение об успешной аутентификации */
          message?: string;
        },
        | {
            error?: string;
            code?: string[];
          }
        | {
            error?: string;
          }
      >({
        path: `/verify-code/`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),
  };
}
