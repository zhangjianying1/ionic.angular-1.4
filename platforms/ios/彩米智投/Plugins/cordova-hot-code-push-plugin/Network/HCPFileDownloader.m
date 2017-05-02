//
//  HCPFileDownloader.m
//
//  Created by Nikolay Demyankov on 11.08.15.
//

#import "HCPFileDownloader.h"
#import "HCPManifestFile.h"
#import "NSData+HCPMD5.h"
#import "NSError+HCPExtension.h"

@interface HCPFileDownloader()<NSURLSessionDownloadDelegate> {
    NSArray *_filesList;
    NSURL *_contentURL;
    NSURL *_folderURL;
    NSDictionary *_headers;
    
    NSURLSession *_session;
    HCPFileDownloadCompletionBlock _complitionHandler;
    NSUInteger _downloadCounter;
}

@end

static NSUInteger const TIMEOUT = 300;

@implementation HCPFileDownloader

#pragma mark Public API

- (instancetype)initWithFiles:(NSArray *)filesList srcDirURL:(NSURL *)contentURL dstDirURL:(NSURL *)folderURL requestHeaders:(NSDictionary *)headers {
    self = [super init];
    if (self) {
        _filesList = filesList;
        _contentURL = contentURL;
        _folderURL = folderURL;
        _headers = headers;
    }
    
    return self;
}

- (NSURLSession *)sessionWithHeaders:(NSDictionary *)headers {
    NSLog(@"sessionWithHeaders");
    NSURLSessionConfiguration *configuration = [NSURLSessionConfiguration defaultSessionConfiguration];
    configuration.requestCachePolicy = NSURLRequestReloadIgnoringLocalCacheData;
    configuration.timeoutIntervalForRequest = TIMEOUT;
    configuration.timeoutIntervalForResource = TIMEOUT;
    if (headers) {
        [configuration setHTTPAdditionalHeaders:headers];
    }
    
    return [NSURLSession sessionWithConfiguration:configuration delegate:self delegateQueue:nil];
}

- (void)startDownloadWithCompletionBlock:(HCPFileDownloadCompletionBlock)block {
    _complitionHandler = block;
    _downloadCounter = 0;
    _session = [self sessionWithHeaders:_headers];
    
    [self launchDownloadTaskForFile:_filesList[0]];
}

#pragma mark NSURLSessionTaskDelegate delegate

- (void)URLSession:(NSURLSession *)session didBecomeInvalidWithError:(NSError *)error {
    if (error && _complitionHandler) {
        _complitionHandler(error);
        _session = nil;
    }
}

- (void)URLSession:(NSURLSession *)session downloadTask:(NSURLSessionDownloadTask *)downloadTask didFinishDownloadingToURL:(NSURL *)location {
    NSError *error = nil;
    if (![self moveLoadedFile:location forFile:_filesList[_downloadCounter] toFolder:_folderURL error:&error]) {
        [_session invalidateAndCancel];
        _session = nil;
        _complitionHandler(error);
        return;
    }
    
    _downloadCounter++;
    if (_downloadCounter >= _filesList.count) {
        [_session finishTasksAndInvalidate];
        _session = nil;
        _complitionHandler(nil);
        return;
    }
    
    [self launchDownloadTaskForFile:_filesList[_downloadCounter]];
}

- (void)launchDownloadTaskForFile:(HCPManifestFile *)file {
    NSURL *url = [_contentURL URLByAppendingPathComponent:file.name];
    NSLog(@"Starting file download: %@", url.absoluteString);
    
    [[_session downloadTaskWithURL:url] resume];
}

#pragma Private API

/**
 *  Check if loaded file is corrupted.
 *
 *  @param file     file's url on the local storage
 *  @param checksum supposed checksum of the data
 *
 *  @return <code>YES</code> if file is corrupted; <code>NO</code> if file is valid
 */
- (BOOL)isFileCorrupted:(NSURL *)file checksum:(NSString *)checksum {
    NSString *dataHash = [[NSData dataWithContentsOfURL:file] md5];
    if ([dataHash isEqualToString:checksum]) {
        return NO;
    }
    
    NSLog(@"Hash %@ doesn't match the checksum %@", dataHash, checksum);
    
    return YES;
}

/**
 *  Move loaded file from the tmp folder to the download folder.
 *
 *  @param loadedFile loaded file url in the tmp folder
 *  @param forFile    what file we loaded according to the manifest
 *  @param folderURL  folder, where to move it
 *  @param error      error entry; <code>nil</code> - if saved successfully;
 *
 *  @return <code>YES</code> - if data is saved; <code>NO</code> - otherwise
 */
- (BOOL)moveLoadedFile:(NSURL *)loadedFile forFile:(HCPManifestFile *)file toFolder:(NSURL *)folderURL error:(NSError **)error {
    if ([self isFileCorrupted:loadedFile checksum:file.md5Hash]) {
        NSString *errorMsg = [NSString stringWithFormat:@"File %@ is corrupted", file.name];
        *error = [NSError errorWithCode:kHCPFailedToDownloadUpdateFilesErrorCode description:errorMsg];
        return NO;
    }
    
    NSURL *filePath = [folderURL URLByAppendingPathComponent:file.name];
    NSFileManager *fileManager = [NSFileManager defaultManager];
    
    // remove old version of the file
    if ([fileManager fileExistsAtPath:filePath.path]) {
        [fileManager removeItemAtURL:filePath error:nil];
    }
    
    // create storage directories
    [fileManager createDirectoryAtPath:[filePath.path stringByDeletingLastPathComponent]
           withIntermediateDirectories:YES
                            attributes:nil
                                 error:nil];
    
    // write data
    return [fileManager moveItemAtURL:loadedFile toURL:filePath error: error];
}


- (void)URLSession:(NSURLSession *)session didReceiveChallenge:(NSURLAuthenticationChallenge *)challenge
 completionHandler:(void (^)(NSURLSessionAuthChallengeDisposition disposition, NSURLCredential * _Nullable credential))completionHandler {
    NSLog(@"证书认证/////");
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
            NSLog(@"信任该证书////");
            
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


@end
