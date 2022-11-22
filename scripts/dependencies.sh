#!/bin/sh
if ! grep -q 'file:../camino-wallet-sdk/package' package.json; then
  echo "No file dependencies required"
  exit 0
fi

# Prepare caminojs
cd ..
git clone https://github.com/chain4travel/caminojs --depth 1 -bdev
cd caminojs
yarn
yarn build
yarn pack
tar -xzf c4tplatform-caminojs-v*.tgz

# prepare camino-wallet-sdk
cd ..
git clone https://github.com/chain4travel/camino-wallet-sdk --depth 1 -bdev
cd camino-wallet-sdk
yarn
yarn build
yarn pack
tar -xzf c4tplatform-camino-wallet-sdk-v*.tgz
sed -i 's/file:..\/caminojs\/package/file:..\/..\/caminojs\/package/1' package/package.json

# Finally restore previous directory
cd ../camino-wallet
