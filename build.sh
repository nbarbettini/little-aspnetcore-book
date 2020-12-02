#!/usr/bin/env bash

gitbook build . book
cd book
rm .gitignore .nojekyll cover.pdn cover_3d.png cover_cn.pdn cover_lulu.png isbn_barcode.pdf build.sh
cd ..
