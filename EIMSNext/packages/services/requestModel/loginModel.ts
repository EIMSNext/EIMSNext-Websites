export interface LoginModel {
    /** 用户名 */
    username: string;
    /** 密码 */
    password: string;
    /** 认证类型*/
    grant_type?: string;
    /** 客户端标识 */
    client_id?: string;
}