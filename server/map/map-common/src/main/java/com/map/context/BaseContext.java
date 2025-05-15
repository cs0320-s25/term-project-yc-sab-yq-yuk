package com.map.context;

public class BaseContext {
  public static ThreadLocal<Long> threadLocal = new ThreadLocal<>();

  public static void setCurrentId(long id){
    threadLocal.set(id);
  }

  public static long getCurrentId(){
    return threadLocal.get();
  }

  public static void removeCurrentId(){
    threadLocal.remove();
  }
}
