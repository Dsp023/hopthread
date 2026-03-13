import os
import time
import subprocess
import argparse

POWERSHELL_PATH = "/mnt/c/Windows/System32/WindowsPowerShell/v1.0/powershell.exe"
RECORD_DURATION = 30
TEMP_WAV = "C:\\Users\\Public\\Anya_monitor.wav"
FINAL_WAV = "/tmp/Anya_hostel_monitor.wav"

def record_audio(duration):
    source = """
    Add-Type -TypeDefinition '
    using System; 
    using System.Runtime.InteropServices; 
    using System.Text; 
    public class Audio { 
        [DllImport("winmm.dll")] 
        public static extern int mciSendString(string command, StringBuilder returnValue, int returnLength, IntPtr winHandle); 
    }';
    [Audio]::mciSendString('open new type waveaudio alias recsound', [System.Text.StringBuilder]::new(0), 0, [IntPtr]::Zero);
    [Audio]::mciSendString('record recsound', [System.Text.StringBuilder]::new(0), 0, [IntPtr]::Zero);
    Start-Sleep -Seconds """ + str(duration) + """;
    [Audio]::mciSendString('save recsound \"""" + TEMP_WAV + """\"', [System.Text.StringBuilder]::new(0), 0, [IntPtr]::Zero);
    [Audio]::mciSendString('close recsound', [System.Text.StringBuilder]::new(0), 0, [IntPtr]::Zero);
    """
    
    try:
        subprocess.run([POWERSHELL_PATH, "-Command", source], check=True)
        # Copy to WSL accessible path
        wsl_temp = "/mnt/c/Users/Public/Anya_monitor.wav"
        if os.path.exists(wsl_temp):
            subprocess.run(["cp", wsl_temp, FINAL_WAV], check=True)
            return True
    except Exception as e:
        print(f"Error during recording: {e}")
    return False

if __name__ == "__main__":
    print(f"Starting 30-second hostel monitoring sequence...")
    if record_audio(RECORD_DURATION):
        print(f"Monitoring complete. File saved to {FINAL_WAV}")
    else:
        print("Monitoring failed.")
