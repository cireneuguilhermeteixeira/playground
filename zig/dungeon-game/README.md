# Installing ZIG

Go to this [URL](https://ziglang.org/download/) and manually download your compatible version


- Extract the archive using tar, e.g.

```
tar xf zig-linux-x86_64-0.13.0.tar.xz
```

- Add the location of your Zig binary to your path, e.g.

```
echo 'export PATH="$HOME/zig-linux-x86_64-0.13.0:$PATH"' >> ~/.bashrc
```

- Reload your bash file settings

```
source ~/.bashrc
```

To run it just need to run this command 

```
zig build-exe main.zig
./main
```


- To run the benchamark 
```
zig build-exe benchmark.zig -O ReleaseFast
./benchmark
```
<img width="684" height="152" alt="image" src="https://github.com/user-attachments/assets/98e5ec19-5a1c-4fcd-80d4-3ac48f832ba4" />

