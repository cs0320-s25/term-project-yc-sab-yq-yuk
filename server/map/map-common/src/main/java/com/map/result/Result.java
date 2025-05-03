package com.map.result;

import lombok.Data;

import java.io.Serializable;

/**
 * 后端统一返回结果
 * @param <T>
 */
@Data
public class Result<T> implements Serializable {

  private Integer code; // 1 for success and 0 for error
  private String msg; // error msg
  private T data; // returned data

  public static <T> Result<T> success() {
    Result<T> result = new Result<T>();
    result.code = 1;
    return result;
  }

  public static <T> Result<T> success(T object) {
    Result<T> result = new Result<T>();
    result.data = object;
    result.code = 1;
    return result;
  }

  public static <T> Result<T> error(String msg) {
    Result result = new Result();
    result.msg = msg;
    result.code = 0;
    return result;
  }
}
