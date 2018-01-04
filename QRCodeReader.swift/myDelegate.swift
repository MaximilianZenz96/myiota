//
//  myWebViewDelegate.swift
//  QRCodeReader.swift
//
//  Created by Maximilian Zenz on 29.12.17.
//  Copyright © 2017 Yannick Loriot. All rights reserved.
//

import Foundation
import UIKit

class myDelegate: UIWebViewDelegate {
    func webView(_ webView: UIWebView, shouldStartLoadWith request: URLRequest, navigationType: UIWebViewNavigationType) -> Bool {
        if request.url?.scheme == "iota" {
            print("Function trggered")
            
        }
        
        return true
    }
}
