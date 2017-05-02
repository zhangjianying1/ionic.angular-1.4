//
//  CDVUpgrade.h
//  upgradeTest
//
//  Created by sope on 15/8/2.
//
//

//#import <Cordova/Cordova.h>
#import <Cordova/CDV.h>
#import <Cordova/CDVPlugin.h>

@interface CDVUpgrade : CDVPlugin

// 获取版本code
- (void)getVersionCode:(CDVInvokedUrlCommand*)command;

@end
