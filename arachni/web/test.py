import subprocess

command =  "rm -r ac"
process = subprocess.Popen(command,shell=True)
ret = process.wait()
print(ret)


