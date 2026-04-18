import paramiko
import sys

def test_connection():
    hostname = "192.168.23.43"
    username = "node_mmi"
    password = "Mmi#666$"
    
    print(f"Connecting to {hostname}...")
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    
    try:
        client.connect(hostname, port=22, username=username, password=password, timeout=10)
        print("SUCCESS: Connection established.")
        stdin, stdout, stderr = client.exec_command("ls -la /home/node_mmi/www/wicar/front")
        print("Output:", stdout.read().decode())
        client.close()
    except Exception as e:
        print(f"FAILED: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    test_connection()
