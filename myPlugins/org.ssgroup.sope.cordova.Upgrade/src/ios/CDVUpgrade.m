//
//  CDVUpgrade.m
//  upgradeTest
//
//  Created by sope on 15/8/2.
//
//

#import "CDVUpgrade.h"


@implementation CDVUpgrade

- (void)getVersionCode:(CDVInvokedUrlCommand*)command{
    NSString* callbackId = command.callbackId;
    NSString* version = [[[NSBundle mainBundle] infoDictionary] objectForKey:@"CFBundleVersion"];
    CDVPluginResult* pluginResult = [CDVPluginResult resultWithStatus:CDVCommandStatus_OK messageAsString:version];
    [self.commandDelegate sendPluginResult:pluginResult callbackId:callbackId];
}


@end
