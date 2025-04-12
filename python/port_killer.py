#!/usr/bin/env python3
"""
Utility to find and optionally kill processes using specific ports
"""
import subprocess
import sys
import os

def find_process_using_port(port):
    """Find process using the specified port"""
    try:
        if sys.platform.startswith('darwin'):  # macOS
            cmd = f"lsof -i :{port} -sTCP:LISTEN -n -P"
            result = subprocess.check_output(cmd, shell=True).decode('utf-8')
            
            if not result or 'COMMAND' not in result:
                return None
                
            lines = result.strip().split('\n')
            if len(lines) < 2:  # No results or just header
                return None
                
            parts = lines[1].split()
            if len(parts) < 2:
                return None
                
            return {
                'pid': parts[1],
                'command': parts[0],
                'user': parts[2]
            }
        elif sys.platform.startswith('win'):  # Windows
            cmd = f"netstat -ano | findstr :{port}"
            result = subprocess.check_output(cmd, shell=True).decode('utf-8')
            
            if not result:
                return None
                
            lines = result.strip().split('\n')
            for line in lines:
                if f":{port}" in line and "LISTENING" in line:
                    parts = line.split()
                    pid = parts[-1]
                    
                    # Get process name
                    cmd = f"tasklist /fi \"PID eq {pid}\" /fo csv /nh"
                    proc_info = subprocess.check_output(cmd, shell=True).decode('utf-8')
                    if proc_info:
                        proc_parts = proc_info.strip().strip('"').split('","')
                        return {
                            'pid': pid,
                            'command': proc_parts[0] if len(proc_parts) > 0 else "Unknown",
                            'user': "N/A"
                        }
            return None
        else:  # Linux and others
            cmd = f"ss -tuln | grep :{port}"
            result = subprocess.check_output(cmd, shell=True).decode('utf-8')
            
            if not result:
                return None
                
            # Get PID using fuser
            cmd = f"fuser {port}/tcp 2>/dev/null"
            try:
                pid = subprocess.check_output(cmd, shell=True).decode('utf-8').strip()
                
                # Get process command
                cmd = f"ps -p {pid} -o comm="
                command = subprocess.check_output(cmd, shell=True).decode('utf-8').strip()
                
                # Get user
                cmd = f"ps -p {pid} -o user="
                user = subprocess.check_output(cmd, shell=True).decode('utf-8').strip()
                
                return {
                    'pid': pid,
                    'command': command,
                    'user': user
                }
            except:
                return None
    except subprocess.CalledProcessError:
        return None

def kill_process(pid):
    """Kill the process with the specified PID"""
    try:
        if sys.platform.startswith('win'):
            subprocess.check_call(f"taskkill /F /PID {pid}", shell=True)
        else:
            subprocess.check_call(f"kill -9 {pid}", shell=True)
        return True
    except subprocess.CalledProcessError:
        return False

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python port_killer.py <port> [--kill]")
        print("Example: python port_killer.py 8000 --kill")
        sys.exit(1)
        
    try:
        port = int(sys.argv[1])
        should_kill = "--kill" in sys.argv
        
        process = find_process_using_port(port)
        if not process:
            print(f"No process found using port {port}")
            sys.exit(0)
            
        print(f"Process using port {port}:")
        print(f"  PID: {process['pid']}")
        print(f"  Command: {process['command']}")
        print(f"  User: {process['user']}")
        
        if should_kill:
            print(f"Attempting to kill process {process['pid']}...")
            if kill_process(process['pid']):
                print(f"Successfully killed process {process['pid']}")
            else:
                print(f"Failed to kill process {process['pid']}")
                if not sys.platform.startswith('win') and os.geteuid() != 0:
                    print("Try running with sudo privileges")
    except ValueError:
        print(f"Invalid port number: {sys.argv[1]}")
        sys.exit(1)
