//
//  HttpPlugin.h
//  HttpPlugin
//
//  Created by cndym on 2016/10/27.
//  Copyright © 2016年 com.cncom.cndym. All rights reserved.
//

#ifndef Http_h
#define Http_h
#import <Cordova/CDVPlugin.h>
#import<CommonCrypto/CommonDigest.h>

@interface Http : CDVPlugin

@property(nonatomic,copy)NSString *reBody;

- (void)httpPost:(CDVInvokedUrlCommand*)command;

- (void)httpsPost:(CDVInvokedUrlCommand*)command;





@end

#endif /* HttpPlugin_h */
