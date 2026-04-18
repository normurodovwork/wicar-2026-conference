import paramiko
import os

def deploy():
    # Try both local and public IPs
    hostnames = ["192.168.23.43", "194.93.25.170"]
    username = "node_mmi"
    password = "Mmi#666$"
    local_file = "wicar-front.zip"
    remote_path = "/home/node_mmi/www/wicar/front"
    
    # Check if local file exists
    if not os.path.exists(local_file):
        print(f"[-] Local file {local_file} not found!")
        return

    success = False
    for hostname in hostnames:
        print(f"[*] Attempting deployment to {hostname}...")
        ssh = paramiko.SSHClient()
        ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
        
        try:
            print(f"[+] Connecting to {hostname}...")
            ssh.connect(hostname, username=username, password=password, timeout=15)
            print(f"[+] Connected to {hostname}!")
            
            # Ensure remote directory exists
            ssh.exec_command(f"mkdir -p {remote_path}")
            
            # Uploading using SFTP
            print(f"[+] Uploading {local_file}...")
            sftp = ssh.open_sftp()
            sftp.put(local_file, f"{remote_path}/{local_file}")
            sftp.close()
            print("[+] Uploaded!")
            
            # Executing remote commands
            print("[*] Configuring server...")
            commands = [
                f"cd {remote_path} && unzip -o {local_file}",
                f"cd {remote_path} && rm {local_file}",
                "pm2 restart wicar-frontend || echo 'PM2 process not found, skipping restart'"
            ]
            
            for cmd in commands:
                print(f"Running: {cmd}")
                stdin, stdout, stderr = ssh.exec_command(cmd)
                out = stdout.read().decode().strip()
                err = stderr.read().decode().strip()
                if out: print(f"Out: {out}")
                if err: print(f"Err: {err}")
                
            print(f"[!] Deployment to {hostname} completed successfully!")
            success = True
            ssh.close()
            break # Exit loop if successful
            
        except Exception as e:
            print(f"[-] Deployment to {hostname} failed: {str(e)}")
            ssh.close()

    if not success:
        print("[!] All deployment attempts failed.")

if __name__ == "__main__":
    deploy()
