package com.map.aspect;

import com.map.annotation.AutoFill;
//import com.map.constant.AutoFillConstant;
import com.map.context.BaseContext;
import com.map.enumeration.DBOperationType;
import java.lang.reflect.Method;
import java.time.LocalDateTime;
import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Before;
import org.aspectj.lang.annotation.Pointcut;
import org.springframework.stereotype.Component;

@Aspect
@Component
@Slf4j
public class AutoFillAspect {

  /**
   * Pointcut
   */
  @Pointcut("execution(* com.map.mapper.*.*(..)) && @annotation(com.map.annotation.AutoFill)")
  public void autoFillPointCut(){};

  /**
   * Before notification
   */
  @Before("autoFillPointCut()")
  public void autoFill(JoinPoint joinPoint){
    //TODO: finish the logic based on our project design
  }
}
