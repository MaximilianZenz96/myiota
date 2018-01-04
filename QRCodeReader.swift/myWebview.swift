import Foundation
import UIKit

class myWebView: NSObject, UIWebViewDelegate {
    var webView = UIWebView()
    
    
    override init()
    {
        super.init()
        webView.delegate = self
        
    }
    
    
    func webView(_ webView: UIWebView, shouldStartLoadWith request: URLRequest, navigationType: UIWebViewNavigationType) -> Bool {
        if request.url?.scheme == "iota" {
            print("test")
            //scanInModalAction()
        }
        return true
    }
    
    func webViewDidStartLoad(_ webView: UIWebView)
    {
        print("Started Loading")
    }
    
    func webViewDidFinishLoad(_ webView: UIWebView)
    {
        print("Finished Loading")
    }
}
