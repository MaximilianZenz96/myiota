//
//  CustomWebView.swift
//  QRCodeReader.swift
//
//  Created by Maximilian Zenz on 30.12.17.
//  Copyright © 2017 Yannick Loriot. All rights reserved.
//

import Foundation
import UIKit

class CustomWebView : NSObject, UIWebViewDelegate
{
    var webView = UIWebView()
    
    override init()
    {
        super.init()
        webView = UIWebView(frame: CGRect(x: 0, y: 0, width: UIScreen.main.bounds.width, height: UIScreen.main.bounds.height))
        webView.delegate = self
        sendRequest()
    }
    
    func sendRequest()
    {
        webView.scalesPageToFit = false
        webView.isMultipleTouchEnabled = false
        webView.scrollView.isScrollEnabled = false
        webView.scrollView.bounces = false
        //3. Load local html file into web view
        //let myProjectBundle:Bundle = Bundle.main
        
        //let filePath:String = myProjectBundle.path(forResource: "/IOTA_Wallet_HTML/index", ofType: "html")!
        let filePath:String = "http://test.mgames.cc/iota/index.html"
        //let filePath:String = "https://atandrastoth.co.uk/main/pages/plugins/webcodecamjs/"
        
        let myURL = URL(string: filePath);
        let myURLRequest = URLRequest(url: myURL!)
        
        webView.loadRequest(myURLRequest)
    }
    
    func webViewDidStartLoad(webView: UIWebView!)
    {
        print("Started Loading")
    }
    
    func webViewDidFinishLoad(webView: UIWebView)
    {
        print("Finished Loading")
    }
}
