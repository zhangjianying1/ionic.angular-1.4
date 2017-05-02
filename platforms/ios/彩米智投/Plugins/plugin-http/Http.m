//
//  HttpPlugin.m
//  HttpPlugin
//
//  Created by cndym on 2016/10/27.
//  Copyright © 2016年 com.cncom.cndym. All rights reserved.
//

#import "Http.h"

#import <ifaddrs.h>
#import <arpa/inet.h>


@interface Http()<NSURLSessionDataDelegate>
-(NSString *) md5:(NSString *) inStr;
-(NSString *) buildMsgMd5Str:(NSDictionary *) dis;
-(NSString *) buildMd5Str:(NSString *) cmd machId:(NSString *) machId msg:(NSString *) msg;
-(NSString *) buildHttpParam:(NSDictionary *) dis;
-(NSString *) getIp;

@end


@implementation Http

NSString * const sid = @"70000";
NSString * const sidKey = @"6ancGkmmGaacGaLLlGLbaF6GFGdGbkba";
NSString * const platform = @"02";

- (void)httpPost:(CDVInvokedUrlCommand*)command
{
    NSString* urlStr = [command.arguments objectAtIndex:0];
    NSDictionary* param = [command.arguments objectAtIndex:1];
    if (urlStr != nil && param !=nil) {
        NSString *paramStr = [self buildHttpParam:param];
        NSMutableString *paramStrBuff = [[NSMutableString alloc] initWithString:@"msg="];
        [paramStrBuff appendString:paramStr];
        NSData *paramData = [paramStrBuff dataUsingEncoding:NSUTF8StringEncoding];
        NSURL *url = [NSURL URLWithString:urlStr];
        NSMutableURLRequest *request = [NSMutableURLRequest requestWithURL:url];
        request.HTTPMethod = @"POST";
        request.HTTPBody = paramData;
        NSURLSession *session = [NSURLSession sharedSession];
        NSURLSessionTask *task =
        [session dataTaskWithRequest:request
                   completionHandler:^(NSData *data, NSURLResponse *response, NSError *error) {
                       _reBody = [[NSString alloc]initWithData:data encoding:NSUTF8StringEncoding];
                       _pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsString:_reBody];
                       [self.commandDelegate sendPluginResult:_pluginResult callbackId:command.callbackId];
                       
                   }];
        [task resume];
    } else {
        _pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsString:@"Arg was null"];
        [self.commandDelegate sendPluginResult:_pluginResult callbackId:command.callbackId];
    }
}


- (void)httpsPost:(CDVInvokedUrlCommand*)command
{
    NSString* urlStr = [command.arguments objectAtIndex:0];
    NSDictionary* param = [command.arguments objectAtIndex:1];
    if (urlStr != nil && param !=nil) {
        NSLog(@"开始请求数据");
        NSString *paramStr = [self buildHttpParam:param];
        NSString *baseString = (__bridge NSString *)CFURLCreateStringByAddingPercentEscapes(kCFAllocatorDefault,(CFStringRef)paramStr,NULL,CFSTR(":/?#[]@!$&’()*+,;="),kCFStringEncodingUTF8);
        NSMutableString *paramStrBuff = [[NSMutableString alloc] initWithString:@"msg="];
        [paramStrBuff appendString:baseString];
        NSLog(@"Result:%@", paramStrBuff);
        
        
        
        NSData *paramData = [paramStrBuff dataUsingEncoding:NSUTF8StringEncoding];
        NSURL *url = [NSURL URLWithString:urlStr];
        NSMutableURLRequest *request = [NSMutableURLRequest requestWithURL:url cachePolicy:NSURLRequestReloadIgnoringCacheData timeoutInterval:10.0f];
        request.HTTPMethod = @"POST";
        NSLog(@"paramData:%@", paramData);
        
        request.HTTPBody = paramData;
        NSURLSession *session = [NSURLSession sessionWithConfiguration:[NSURLSessionConfiguration defaultSessionConfiguration] delegate:self delegateQueue:[NSOperationQueue mainQueue]];
        NSURLSessionTask *task =
        [session dataTaskWithRequest:request completionHandler:^(NSData *data, NSURLResponse *response, NSError *error) {
            _reBody = [[NSString alloc]initWithData:data encoding:NSUTF8StringEncoding];
            NSLog(@"请求数据完成");
            _pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsString:_reBody];
            [self.commandDelegate sendPluginResult:_pluginResult callbackId:command.callbackId];
        }];
        [task resume];
    } else {
        _pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_ERROR messageAsString:@"Arg was null"];
        [self.commandDelegate sendPluginResult:_pluginResult callbackId:command.callbackId];
        
    }
}
- (void)URLSession:(NSURLSession *)session didReceiveChallenge:(NSURLAuthenticationChallenge *)challenge
 completionHandler:(void (^)(NSURLSessionAuthChallengeDisposition disposition, NSURLCredential * _Nullable credential))completionHandler {
    NSLog(@"证书认证");
    if ([[[challenge protectionSpace] authenticationMethod] isEqualToString: NSURLAuthenticationMethodServerTrust]) {
        do
        {
            SecTrustRef serverTrust = [[challenge protectionSpace] serverTrust];
            NSCAssert(serverTrust != nil, @"serverTrust is nil");
            if(nil == serverTrust)
            break; /* failed */
            /**
             *  导入多张CA证书（Certification Authority，支持SSL证书以及自签名的CA），请替换掉你的证书名称
             */
            NSString *cerPath = [[NSBundle mainBundle] pathForResource:@"icaimi" ofType:@"cer"];//自签名证书
            NSData* caCert = [NSData dataWithContentsOfFile:cerPath];
            
            NSCAssert(caCert != nil, @"caCert is nil");
            if(nil == caCert)
            break; /* failed */
            
            SecCertificateRef caRef = SecCertificateCreateWithData(NULL, (__bridge CFDataRef)caCert);
            NSCAssert(caRef != nil, @"caRef is nil");
            if(nil == caRef)
            break; /* failed */
            
            //可以添加多张证书
            NSArray *caArray = @[(__bridge id)(caRef)];
            
            NSCAssert(caArray != nil, @"caArray is nil");
            if(nil == caArray)
            break; /* failed */
            
            //将读取的证书设置为服务端帧数的根证书
            OSStatus status = SecTrustSetAnchorCertificates(serverTrust, (__bridge CFArrayRef)caArray);
            NSCAssert(errSecSuccess == status, @"SecTrustSetAnchorCertificates failed");
            if(!(errSecSuccess == status))
            break; /* failed */
            
            SecTrustResultType result = -1;
            //通过本地导入的证书来验证服务器的证书是否可信
            status = SecTrustEvaluate(serverTrust, &result);
            if(!(errSecSuccess == status))
            break; /* failed */
            NSLog(@"stutas:%d",(int)status);
            NSLog(@"Result: %d", result);
            
            BOOL allowConnect = (result == kSecTrustResultUnspecified) || (result == kSecTrustResultProceed);
            if (allowConnect) {
                NSLog(@"success");
            }else {
                NSLog(@"error");
            }
            
            /* kSecTrustResultUnspecified and kSecTrustResultProceed are success */
            if(! allowConnect)
            {
                break; /* failed */
            }
            
#if 0
            /* Treat kSecTrustResultConfirm and kSecTrustResultRecoverableTrustFailure as success */
            /*   since the user will likely tap-through to see the dancing bunnies */
            if(result == kSecTrustResultDeny || result == kSecTrustResultFatalTrustFailure || result == kSecTrustResultOtherError)
            break; /* failed to trust cert (good in this case) */
#endif
            
            // The only good exit point
            NSLog(@"信任该证书");
            
            NSURLCredential *credential = [NSURLCredential credentialForTrust:challenge.protectionSpace.serverTrust];
            completionHandler(NSURLSessionAuthChallengeUseCredential,credential);
            return [[challenge sender] useCredential: credential
                          forAuthenticationChallenge: challenge];
            
        }
        while(0);
    }
    
    // Bad dog
    NSURLCredential *credential = [NSURLCredential credentialForTrust:challenge.protectionSpace.serverTrust];
    completionHandler(NSURLSessionAuthChallengeCancelAuthenticationChallenge,credential);
    return [[challenge sender] cancelAuthenticationChallenge: challenge];
}


- (NSString *) md5:(NSString *) inStr {
    const char *cStr = [inStr UTF8String];
    unsigned char digest[CC_MD5_DIGEST_LENGTH];
    CC_LONG len =(CC_LONG)strlen(cStr);
    CC_MD5(cStr, len, digest );
    NSMutableString *output = [NSMutableString stringWithCapacity:CC_MD5_DIGEST_LENGTH * 2];
    for(int i = 0; i < CC_MD5_DIGEST_LENGTH; i++)
    [output appendFormat:@"%02x", digest[i]];
    return  output;
}

-(NSString *) buildMsgMd5Str:(NSDictionary *) dis{
    NSMutableString *msgMd5Str = [[NSMutableString alloc] initWithString:@""];
    NSArray *keys = [dis allKeys];
    NSArray *newKeys = [keys sortedArrayUsingSelector:@selector(compare:)];
    for (NSString *key in newKeys) {
        [msgMd5Str appendString:key];
        [msgMd5Str appendString:@"="];
        [msgMd5Str appendString:[dis objectForKey:key]];
    }
    return msgMd5Str;
}

-(NSString *) buildMd5Str:(NSString *) cmd machId:(NSString *) machId msg:(NSString *) msg{
    NSDictionary *infoDictionary = [[NSBundle mainBundle] infoDictionary];
    NSMutableString *md5String = [[NSMutableString alloc] initWithString:@""];
    [md5String appendString: cmd];
    [md5String appendString:[self getIp]];
    [md5String appendString:machId];
    [md5String appendString:[[UIDevice currentDevice] model]];
    [md5String appendString:msg];
    [md5String appendString:platform];
    [md5String appendString:sid];
    [md5String appendString:[infoDictionary objectForKey:@"CFBundleShortVersionString"]];
    [md5String appendString:[[UIDevice currentDevice] systemVersion]];
    [md5String appendString:sidKey];
    
    NSLog(@"md5Str=%@",md5String);
    return md5String;
    
}


-(NSString *) buildHttpParam:(NSDictionary *) dis{
    NSDictionary *infoDictionary = [[NSBundle mainBundle] infoDictionary];
    
    NSString *md5Str = [self md5:[self buildMd5Str:[dis objectForKey:@"cmd"]
                                            machId:[dis objectForKey:@"machId"]
                                               msg:[self buildMsgMd5Str:[dis objectForKey:@"msg"]]]
                        ];
    
    NSDictionary *paramObj = [NSDictionary dictionaryWithObjectsAndKeys:
                              sid,@"sid",
                              platform,@"platform",
                              [dis objectForKey:@"cmd"],@"cmd",
                              [dis objectForKey:@"func"],@"func",
                              [dis objectForKey:@"machId"],@"machId",
                              [[UIDevice currentDevice] model],@"machName",
                              [infoDictionary objectForKey:@"CFBundleShortVersionString"],@"softVer",
                              [[UIDevice currentDevice] systemVersion],@"sysVer",
                              [dis objectForKey:@"token"],@"token",
                              [self getIp],@"ip",
                              md5Str,@"md5",
                              [dis objectForKey:@"msg"],@"msg",
                              nil];
    
    NSData *jsonData = [NSJSONSerialization dataWithJSONObject:paramObj
                                                       options:NSJSONWritingPrettyPrinted
                                                         error:nil];
    
    NSString *jsonString = [[NSString alloc] initWithData:jsonData encoding:NSUTF8StringEncoding];
    return jsonString;
}


- (NSString *) getIp{
    NSString *address = @"error";
    struct ifaddrs *interfaces = NULL;
    struct ifaddrs *temp_addr = NULL;
    int success = 0;
    success = getifaddrs(&interfaces);
    if (success == 0)
    {
        temp_addr = interfaces;
        while(temp_addr != NULL)
        {
            if(temp_addr->ifa_addr->sa_family == AF_INET)
            {
                if([[NSString stringWithUTF8String:temp_addr->ifa_name] isEqualToString:@"en0"])
                {
                    address = [NSString stringWithUTF8String:inet_ntoa(((struct sockaddr_in *)temp_addr->ifa_addr)->sin_addr)];
                }
            }
            temp_addr = temp_addr->ifa_next;
        }
    }
    freeifaddrs(interfaces);
    return address;
}


- (void)didReceiveMemoryWarning {
    [super onMemoryWarning];
    // Dispose of any resources that can be recreated.
}

@end
