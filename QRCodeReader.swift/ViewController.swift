
import AVFoundation
import UIKit
import WebKit
import Photos

extension ViewController: UIScrollViewDelegate {
    func scrollViewWillBeginZooming(_ scrollView: UIScrollView, with view: UIView?) {
        scrollView.pinchGestureRecognizer?.isEnabled = false
    }
    func viewForZooming(in: UIScrollView) -> UIView? {
        return nil;
    }
}
extension ViewController : WKUIDelegate{
    func webView(_ webView: WKWebView, runJavaScriptAlertPanelWithMessage message: String, initiatedByFrame frame: WKFrameInfo,
                 completionHandler: @escaping () -> Void) {
        
        let alertController = UIAlertController(title: nil, message: message, preferredStyle: .actionSheet)
        alertController.addAction(UIAlertAction(title: "OK", style: .default, handler: { (action) in
            completionHandler()
        }))
        
        present(alertController, animated: true, completion: nil)
    }
    
    
    func webView(_ webView: WKWebView, runJavaScriptConfirmPanelWithMessage message: String, initiatedByFrame frame: WKFrameInfo,
                 completionHandler: @escaping (Bool) -> Void) {
        
        let alertController = UIAlertController(title: nil, message: message, preferredStyle: .actionSheet)
        
        alertController.addAction(UIAlertAction(title: "OK", style: .default, handler: { (action) in
            completionHandler(true)
        }))
        
        alertController.addAction(UIAlertAction(title: "Cancel", style: .default, handler: { (action) in
            completionHandler(false)
        }))
        
        present(alertController, animated: true, completion: nil)
    }
    
    
    func webView(_ webView: WKWebView, runJavaScriptTextInputPanelWithPrompt prompt: String, defaultText: String?, initiatedByFrame frame: WKFrameInfo,
                 completionHandler: @escaping (String?) -> Void) {
        
        let alertController = UIAlertController(title: nil, message: prompt, preferredStyle: .actionSheet)
        
        alertController.addTextField { (textField) in
            textField.text = defaultText
        }
        
        alertController.addAction(UIAlertAction(title: "OK", style: .default, handler: { (action) in
            if let text = alertController.textFields?.first?.text {
                completionHandler(text)
            } else {
                completionHandler(defaultText)
            }
        }))
        
        alertController.addAction(UIAlertAction(title: "Cancel", style: .default, handler: { (action) in
            completionHandler(nil)
        }))
        
        present(alertController, animated: true, completion: nil)
    }
}

class ViewController: UIViewController, QRCodeReaderViewControllerDelegate {
    
    //let webView : UIWebView = UIWebView(frame: CGRect(x: 0, y: 50, width: UIScreen.main.bounds.width, height: UIScreen.main.bounds.height))

    var WKView: WKWebView!
    
    override func viewDidLoad() {
        super.viewDidLoad()
        checkPhotoLibraryPermission()
        // Do any additional setup after loading the view, typically from a nib.
        /*self.view.addSubview(webView)
        
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
        
        webView.loadRequest(myURLRequest)*/
        
        //Configuration
        let jscript = "var meta = document.createElement('meta'); meta.setAttribute('name', 'viewport'); meta.setAttribute('content', 'width=device-width'); document.getElementsByTagName('head')[0].appendChild(meta);"
        let userScript = WKUserScript(source: jscript, injectionTime: .atDocumentEnd, forMainFrameOnly: true)
        let wkUController = WKUserContentController()
        wkUController.addUserScript(userScript)
        let wkWebConfig = WKWebViewConfiguration()
        wkWebConfig.userContentController = wkUController
        wkWebConfig.allowsInlineMediaPlayback = true
        //initialize WK
        
        UIApplication.shared.statusBarStyle = .lightContent

        
        WKView = WKWebView(frame: CGRect(x: 0, y: UIApplication.shared.statusBarFrame.height, width: UIScreen.main.bounds.width, height: UIScreen.main.bounds.height-UIApplication.shared.statusBarFrame.height), configuration: wkWebConfig)
        //view = WKView
        view.addSubview(WKView)
        WKView.uiDelegate = self
        //settings
        WKView.isMultipleTouchEnabled = false
        WKView.scrollView.isScrollEnabled = false
        WKView.scrollView.bounces = false
        
        //Load Page
        //let myProjectBundle:Bundle = Bundle.main
        //let filePath:String = myProjectBundle.path(forResource: "iota/index", ofType: "html")!
        //ja print(filePath)
        //let filePath:String = "http://test.mgames.cc/iota/index.html"
        //let url = URL(string: filePath)
        
        let url = URL(fileURLWithPath: Bundle.main.path(forResource: "iota/index", ofType: "html")!)
        //WKView.load(URLRequest(url: url!))
        WKView.loadFileURL(url, allowingReadAccessTo: url)
        WKView.allowsBackForwardNavigationGestures = true
        self.WKView.scrollView.delegate = self
        //js remote functions
        let commander = BridgeCommander(WKView!)
        commander.add("scanQR") {
            command in
            self.scanInModalAction()
            command.send(args: "Scann OK")
        }
        
        commander.add("copyToClipboard") {
            command in
            UIPasteboard.general.string = command.args
            command.send(args: "Copy ok")
        }
        
        commander.add("enableScrolling") {
            command in
            self.WKView.scrollView.isScrollEnabled = true
            command.send(args: "Scrolling activated")
        }
        
        commander.add("disableScrolling") {
            command in
            self.WKView.scrollView.isScrollEnabled = false
            command.send(args: "Scrolling deactivated")
        }
    }
    
    func checkPhotoLibraryPermission() {
        let status = PHPhotoLibrary.authorizationStatus()
        switch status {
        case .authorized: break
        //handle authorized status
        case .denied, .restricted : break
        //handle denied status
        case .notDetermined:
            // ask for permissions
            PHPhotoLibrary.requestAuthorization() { status in
                switch status {
                case .authorized: break
                // as above
                case .denied, .restricted: break
                // as above
                case .notDetermined: break
                    // won't happen but still
                }
            }
        }
    }
    
    /*
    func webView(_ webView: UIWebView, shouldStartLoadWith request: URLRequest, navigationType: UIWebViewNavigationType) -> Bool {
        if request.url?.scheme == "iota" {
            print("test")
            scanInModalAction()
        }
        return true
    }*/
    
    
    
    lazy var reader: QRCodeReader = QRCodeReader()
    lazy var readerVC: QRCodeReaderViewController = {
        let builder = QRCodeReaderViewControllerBuilder {
            $0.reader          = QRCodeReader(metadataObjectTypes: [.qr], captureDevicePosition: .back)
            $0.showTorchButton = true
            
            $0.reader.stopScanningWhenCodeIsFound = false
        }
        
        return QRCodeReaderViewController(builder: builder)
    }()
    
    
    // MARK: - Actions
    
    private func checkScanPermissions() -> Bool {
        do {
            return try QRCodeReader.supportsMetadataObjectTypes()
        } catch let error as NSError {
            let alert: UIAlertController
            
            switch error.code {
            case -11852:
                alert = UIAlertController(title: "Error", message: "This app is not authorized to use Back Camera.", preferredStyle: .alert)
                
                alert.addAction(UIAlertAction(title: "Setting", style: .default, handler: { (_) in
                    DispatchQueue.main.async {
                        if let settingsURL = URL(string: UIApplicationOpenSettingsURLString) {
                            UIApplication.shared.openURL(settingsURL)
                        }
                    }
                }))
                
                alert.addAction(UIAlertAction(title: "Cancel", style: .cancel, handler: nil))
            default:
                alert = UIAlertController(title: "Error", message: "Reader not supported by the current device", preferredStyle: .alert)
                alert.addAction(UIAlertAction(title: "OK", style: .cancel, handler: nil))
            }
            
            present(alert, animated: true, completion: nil)
            
            return false
        }
    }
    
    func scanInModalAction() {
        guard checkScanPermissions() else { return }
        
        readerVC.modalPresentationStyle = .formSheet
        
        readerVC.delegate               = self
        
        readerVC.completionBlock = { (result: QRCodeReaderResult?) in
            if let result = result {
                print("Completion with result: \(result.value) of type \(result.metadataType)")
                
                let fillForm = String(format: "document.getElementById('txtToAddr').value = '\(result.value)';")
                self.WKView.evaluateJavaScript(fillForm)
            }
        }
        
        present(readerVC, animated: true, completion: nil)
    }
    
    // MARK: - QRCodeReader Delegate Methods
    
    func reader(_ reader: QRCodeReaderViewController, didScanResult result: QRCodeReaderResult) {
        reader.stopScanning()
        
        dismiss(animated: true) { [weak self] in
            let alert = UIAlertController(
                title: "QRCodeReader",
                message: String (format:"%@ (of type %@)", result.value, result.metadataType),
                preferredStyle: .alert
            )
            alert.addAction(UIAlertAction(title: "OK", style: .cancel, handler: nil))
 
            //self?.present(alert, animated: true, completion: nil)
        }
    }
    
    func reader(_ reader: QRCodeReaderViewController, didSwitchCamera newCaptureDevice: AVCaptureDeviceInput) {
        print("Switching capturing to: \(newCaptureDevice.device.localizedName)")
    }
    
    func readerDidCancel(_ reader: QRCodeReaderViewController) {
        reader.stopScanning()
        
        dismiss(animated: false, completion: nil)
    }

}
