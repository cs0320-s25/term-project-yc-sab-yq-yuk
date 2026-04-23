package com.map.exception;

public class UserNotLoggedInException extends RuntimeException {

  // default
  public UserNotLoggedInException(){}

  public UserNotLoggedInException(String msg){
    super(msg);
  }
}
