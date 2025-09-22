import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Camera, ScanLine, Play, Pause, AlertTriangle, CheckCircle, Info, Zap } from "lucide-react";
import { BrowserMultiFormatReader, BrowserCodeReader, Result, BarcodeFormat, DecodeHintType } from '@zxing/library';

interface BarcodeScannerProps {
  onScan?: (barcode: string) => void;
}

type CameraStatus = 'idle' | 'requesting' | 'granted' | 'denied' | 'error';

export default function BarcodeScanner({ onScan }: BarcodeScannerProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [manualBarcode, setManualBarcode] = useState("");
  const [lastScanned, setLastScanned] = useState("");
  const [cameraStatus, setCameraStatus] = useState<CameraStatus>('idle');
  const [errorMessage, setErrorMessage] = useState("");
  const [scanSuccess, setScanSuccess] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  // Hold the codeReader instance to stop the scan
  const codeReaderRef = useRef<BrowserMultiFormatReader | null>(null);

  // Add new styles for video element
  const videoStyle = {
    width: '100%',
    height: '100%',
    objectFit: 'cover' as const,
    transform: 'scaleX(-1)', // Mirror the video for better UX
  };

  useEffect(() => {
    // This effect now only handles cleanup when the component unmounts.
    return () => {
      if (codeReaderRef.current) {
        codeReaderRef.current.reset();
        codeReaderRef.current = null;
      }
    };
  }, []);
  const handleSuccessfulScan = (barcode: string) => {
    setLastScanned(barcode);
    setScanSuccess(true);
    onScan?.(barcode);

    // Play success sound...
    try {
      const audio = new Audio("data:audio/wav;base64,...");
      audio.volume = 0.3;
      audio.play().catch(() => { });
    } catch { }

    // Cooldown only for success state, not for lastScanned
    setTimeout(() => {
      setScanSuccess(false);
    }, 500);
  };

  const startScanning = async () => {
    // Ensure we are not already scanning
    if (isScanning) return;

    setCameraStatus('requesting');
    setErrorMessage("");
    setIsScanning(true); // Show video element immediately

    // We need to wait for the state update to render the video element
    // before we can attach the camera to it.
    setTimeout(async () => {
      try {
        if (!videoRef.current) {
          throw new Error("Video element not available.");
        }

        // --- START OF HIGH-QUALITY CAMERA LOGIC ---

        // 1. Define high-resolution constraints
        const constraints: MediaStreamConstraints = {
          video: {
            // Request a higher resolution. 'ideal' will not fail if not available.
            width: { ideal: 1920 },
            height: { ideal: 1080 },
            // Strongly prefer the rear camera
            facingMode: 'environment'
          }
        };

        // 2. Try to find the best rear camera explicitly
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoInputDevices = devices.filter(device => device.kind === 'videoinput');
        const rearCamera = videoInputDevices.find(device =>
          /back|environment/i.test(device.label)
        );

        if (rearCamera) {
          // If we found a specific rear camera, use its deviceId
          (constraints.video as MediaTrackConstraints).deviceId = { exact: rearCamera.deviceId };
        }

        // --- END OF HIGH-QUALITY CAMERA LOGIC ---

        const hints = new Map();
        const formats = [
          BarcodeFormat.EAN_13, BarcodeFormat.EAN_8, BarcodeFormat.CODE_128,
          BarcodeFormat.CODE_39, BarcodeFormat.UPC_A, BarcodeFormat.UPC_E,
          BarcodeFormat.QR_CODE
        ];
        hints.set(DecodeHintType.POSSIBLE_FORMATS, formats);
        const codeReader = new BrowserMultiFormatReader(hints);
        codeReaderRef.current = codeReader;

        // Use `decodeFromConstraints` to apply our high-quality settings
        codeReader.decodeFromConstraints(
          constraints,
          videoRef.current,
          (result, err) => {
            if (result) {
              handleSuccessfulScan(result.getText());
            }
            // Non-critical errors are ignored as the scanner keeps trying
          }
        );

        setCameraStatus('granted');

      } catch (error: any) {
        console.error("Camera Initialization Failed:", error);
        setIsScanning(false);
        setCameraStatus('idle');

        if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
          setErrorMessage("Camera permission denied. You must allow camera access in your browser settings.");
          setCameraStatus('denied');
        } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
          setErrorMessage("No suitable camera found. Please ensure a camera is connected and enabled.");
          setCameraStatus('error');
        } else {
          setErrorMessage(`Camera failed to start: ${error.message}.`);
          setCameraStatus('error');
        }
      }
    }, 100); // Short delay to allow video element to render
  };

  const stopScanning = () => {
    if (codeReaderRef.current) {
      codeReaderRef.current.reset();
      codeReaderRef.current = null;
    }
    setIsScanning(false);
    setCameraStatus('idle');
    setErrorMessage("");
  };

  const handleManualSubmit = () => {
    if (manualBarcode.trim()) {
      setLastScanned(manualBarcode);
      setScanSuccess(true);
      onScan?.(manualBarcode);
      setManualBarcode("");

      setTimeout(() => setScanSuccess(false), 2000);
    }
  };

  const simulateScan = () => {
    // Mock barcode for testing
    const randomBarcode = "1234567890123";

    setLastScanned(randomBarcode);
    setScanSuccess(true);
    onScan?.(randomBarcode);

    // Play success sound
    try {
      const audio = new Audio("data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmIPCC2J0fPTfiMFl2+z9N2QQAoUXrTp66hVFApGn+DyvmIPCC2J0fPTfiMFl2+z9N2QQAoUXrTp66hVFApGn+DyvmIPCC2J0fPTfiMFl2+z9N2QQAoUXrTp66hVFApGn+DyvmIPCC2J0fPTfiMFl2+z9N2QQAoUXrTp66hVFApGn+DyvmIPCC2J0fPTfiMFl2+z9N2QQAoUXrTp66hVFApGn+DyvmIPCC2J0fPTfiMFl2+z9N2QQAoUXrTp66hVFApGn+DyvmIPCC2J0fPTfiMFl2+z9N2QQAoUXrTp66hVFApGn+DyvmIPCC2J0fPTfiMFl2+z9N2QQAoUXrTp66hVFApGn+DyvmIPCC2J0fPTfiMFl2+z9N2QQAoUXrTp66hVFApGn+DyvmIPCC2J0fPTfiMFl2+z9N2QQAoUXrTp66hVFApGn+DyvmIPCC2J0fPTfiMFl2+z9N2QQAoUXrTp66hVFApGn+DyvmIPCC2J0fPTfiMFl2+z9N2QQAoUXrTp66hVFApGn+DyvmIPCC2J0fPTfiMF");
      audio.volume = 0.3;
      audio.play().catch(() => { });
    } catch { }

    setTimeout(() => setScanSuccess(false), 2000);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <ScanLine className="w-5 h-5 mr-2" />
          Barcode Scanner
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Error Messages */}
        {errorMessage && (
          <Alert variant={cameraStatus === 'denied' ? 'destructive' : 'default'}>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        )}

        {cameraStatus === 'denied' && (
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-2">
                <p><strong>To enable camera access:</strong></p>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>Click the camera icon in your browser's address bar</li>
                  <li>Select "Allow" for camera permissions</li>
                  <li>Refresh the page and try again</li>
                </ul>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setCameraStatus('idle');
                    setErrorMessage("");
                  }}
                  className="mt-2"
                >
                  Try Again
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Success Messages */}
        { /*lastScanned && !scanSuccess && (
          <Alert className="absolute bottom-4 left-4 right-4 z-10 bg-background/90">
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Last Scanned:</strong> {lastScanned}
            </AlertDescription>
          </Alert>
        )*/}

        {scanSuccess && (
          <Alert variant="default" className="absolute bottom-4 left-4 right-4 z-10 bg-green-100 dark:bg-green-900 border-green-300 dark:border-green-700">
            <Zap className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800 dark:text-green-200">
              <strong>Scan Successful!</strong>
            </AlertDescription>
          </Alert>
        )}

        {/* Camera Section */}
        <div className="aspect-square bg-black rounded-lg relative overflow-hidden">
          {isScanning ? (
            <>
              <video
                ref={videoRef}
                // The library will handle playsInline and other attributes.
                // We just provide the container.
                className="absolute inset-0"
                style={videoStyle}
              />
              {/* Scanning Overlay */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-3/4 h-1/3 relative">
                  {/* Corner brackets for the scan region */}
                  <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-primary rounded-tl-lg"></div>
                  <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-primary rounded-tr-lg"></div>
                  <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-primary rounded-bl-lg"></div>
                  <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-primary rounded-br-lg"></div>

                  {/* Animated Scan Line */}
                  <div className={`absolute inset-x-2 top-0 h-1 ${scanSuccess ? 'bg-green-500' : 'bg-primary'} opacity-70 shadow-lg animate-scan-vertical`}></div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center text-muted-foreground">
                <Camera className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p className="text-sm opacity-75 mb-4">
                  Camera will appear here when scanning
                </p>
                <Button onClick={startScanning} variant="secondary" disabled={cameraStatus === 'requesting'}>
                  <Play className="w-4 h-4 mr-2" />
                  Start Camera
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Camera Controls */}
        <div className="flex justify-center space-x-2">
          {isScanning ? (
            <Button onClick={stopScanning} variant="outline">
              <Pause className="w-4 h-4 mr-2" />
              Stop Camera
            </Button>
          ) : (
            <Button
              onClick={startScanning}
              variant="outline"
              disabled={cameraStatus === 'requesting'}
            >
              {cameraStatus === 'requesting' ? (
                <>
                  <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-current border-r-transparent" />
                  Starting Camera...
                </>
              ) : (
                <>
                  <Camera className="w-4 h-4 mr-2" />
                  Start Camera
                </>
              )}
            </Button>
          )}
        </div>

        {/* Quick Test Button */}
        <Button
          onClick={simulateScan}
          className="w-full"
          variant="outline"
        >
          <Zap className="w-4 h-4 mr-2" />
          Quick Test Scan (Demo)
        </Button>

        {/* Manual Entry */}
        <div className="space-y-2">
          <Label htmlFor="barcode-manual">Manual Barcode Entry</Label>
          <div className="flex gap-2">
            <Input
              id="barcode-manual"
              placeholder="Enter barcode manually..."
              value={manualBarcode}
              onChange={(e) => setManualBarcode(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleManualSubmit()}
            />
            <Button onClick={handleManualSubmit} disabled={!manualBarcode.trim()}>
              Add
            </Button>
          </div>
        </div>

        {/* Instructions */}
        <div className="text-xs text-muted-foreground space-y-1">
          <p><strong>How to use:</strong></p>
          <p>• Click "Quick Test Scan" to test immediately</p>
          <p>• Click "Start Camera" and allow permissions</p>
          <p>• Type barcode manually in the input field</p>
          <p>• Position barcode within the scanning area</p>
          {window.location.protocol !== 'https:' && window.location.hostname !== 'localhost' && (
            <p className="text-yellow-600">⚠️ Camera requires HTTPS for security</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

/* Add this to your global.css or a style tag if you don't have one */
/* 
@keyframes scan-vertical {
  0% { transform: translateY(0); }
  100% { transform: translateY(calc(33vh - 0.25rem)); } 
}
.animate-scan-vertical {
  animation: scan-vertical 2s ease-in-out infinite alternate;
}
*/