import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function CameraTest() {
  const [testResult, setTestResult] = useState<string>("");
  const [isTesting, setIsTesting] = useState(false);

  const testCameraSupport = async () => {
    setIsTesting(true);
    setTestResult("");
    let results: string[] = [];

    // Check basic browser support
    if (!navigator.mediaDevices) {
      results.push("❌ MediaDevices API not supported");
      setTestResult(results.join('\n'));
      setIsTesting(false);
      return;
    } else {
      results.push("✅ MediaDevices API supported");
    }

    if (!navigator.mediaDevices?.getUserMedia) {
      results.push("❌ getUserMedia not supported");
    } else {
      results.push("✅ getUserMedia supported");
    }

    // Check protocol
    if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') {
      results.push("❌ Camera requires a secure context (HTTPS or localhost)");
    } else {
      results.push("✅ Secure context (HTTPS or localhost) confirmed");
    }

    // Check permissions API
    if (!navigator.permissions) {
      results.push("⚠️ Permissions API not supported (will try direct access)");
    } else {
      results.push("✅ Permissions API supported");
      try {
        const permission = await navigator.permissions.query({ name: 'camera' as PermissionName });
        results.push(`📋 Initial camera permission state: ${permission.state}`);
        permission.onchange = () => {
          setTestResult(prev => prev + `\n📋 Permission state changed to: ${permission.state}`);
        };
      } catch (error) {
        results.push("⚠️ Could not query camera permission");
      }
    }

    // Test actual camera access and list devices
    try {
      results.push("\nAttempting to access camera...");
      setTestResult(results.join('\n'));

      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      results.push("✅ Camera access successful!");

      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(device => device.kind === 'videoinput');

      if (videoDevices.length > 0) {
        results.push(`\nFound ${videoDevices.length} video device(s):`);
        videoDevices.forEach((device, i) => {
          results.push(`  ${i + 1}: ${device.label || `Camera ${i + 1}`}`);
        });
      } else {
        results.push("⚠️ No video devices found after granting permission.");
      }

      // Important: stop the tracks to turn off the camera light
      stream.getTracks().forEach(track => track.stop());
    } catch (error: any) {
      results.push(`❌ Camera access failed: ${error.name}`);
      results.push(`   Message: ${error.message}`);
      if (error.name === 'NotAllowedError') {
        results.push("   Suggestion: Please grant camera permission in your browser's settings for this site.");
      }
    }

    setTestResult(results.join('\n'));
    setIsTesting(false);
  };

  return (
    <Card className="max-w-md">
      <CardHeader>
        <CardTitle>Camera Compatibility Test</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button onClick={testCameraSupport} disabled={isTesting}>
          {isTesting ? "Testing..." : "Run Camera Test"}
        </Button>

        {testResult && (
          <div className="p-3 bg-muted rounded text-sm font-mono">
            <pre className="whitespace-pre-wrap break-words">{testResult}</pre>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
