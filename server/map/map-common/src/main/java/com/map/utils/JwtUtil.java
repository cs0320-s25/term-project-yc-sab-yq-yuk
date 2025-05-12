package com.map.utils;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtBuilder;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.Map;

public class JwtUtil {
  /**
   * generate jwt
   * use HS256. private key is fixed
   *
   * @param secretKey jwt secret key
   * @param ttlMillis jwt time to last
   * @param claims    setting info
   * @return
   */
  public static String createJWT(String secretKey, long ttlMillis, Map<String, Object> claims) {
    // signing algo, for the header
    SignatureAlgorithm signatureAlgorithm = SignatureAlgorithm.HS256;

    // the timestamp that the current jwt is generated
    long expMillis = System.currentTimeMillis() + ttlMillis;
    Date exp = new Date(expMillis);

    // set the jwt body
    JwtBuilder builder = Jwts.builder()
        .setClaims(claims)
        .signWith(signatureAlgorithm, secretKey.getBytes(StandardCharsets.UTF_8))
        .setExpiration(exp);

    return builder.compact();
  }

  /**
   * Token解密
   *
   * @param secretKey jwt秘钥 此秘钥一定要保留好在服务端, 不能暴露出去, 否则sign就可以被伪造, 如果对接多个客户端建议改造成多个
   * @param token     加密后的token
   * @return
   */
  public static Claims parseJWT(String secretKey, String token) {
    // 得到DefaultJwtParser
    Claims claims = Jwts.parser()
        // 设置签名的秘钥
        .setSigningKey(secretKey.getBytes(StandardCharsets.UTF_8))
        // 设置需要解析的jwt
        .parseClaimsJws(token).getBody();
    return claims;
  }

}
