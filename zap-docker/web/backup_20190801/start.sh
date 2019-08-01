#!/bin/bash
sudo /zap/zap.sh -host 0.0.0.0 -port 5000 -daemon -config api.addrs.addr.name=.* -config api.addrs.addr.regex=true -config api.disablekey=true &
python3 app.py
