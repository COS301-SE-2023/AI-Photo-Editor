#!/bin/bash

blixPluginDirectory=$(realpath "$(dirname "$0")/../blix-plugins/")

# ===================================================================
# GLFX
# ===================================================================

echo "Installing glfx-plugin node_modules..."
cd "$blixPluginDirectory/glfx-plugin"
output=$(npm ci 2>&1) && echo "$output" || echo "$output"

echo "Building glfx-plugin..."
output=$(npm run build 2>&1) && echo "$output" || echo "$output"

echo "Building glfx-plugin completed"

# ===================================================================
# BLINK
# ===================================================================

tsconfigPath=$(realpath "$blixPluginDirectory/blink/node_modules/@tsconfig/svelte/tsconfig.json")
blinkDirectory=$(realpath "$blixPluginDirectory/blink")

echo "Installing blink node_modules..."
cd "$blinkDirectory"
output=$(npm ci 2>&1) && echo "$output" || echo "$output"

echo "Attempting to fix tsconfig..."
if test -f "$tsconfigPath"; then
    tsconfigRaw=$(cat "$tsconfigPath")
    withoutComments=$(echo "$tsconfigRaw" | sed '/\/\*/,/\*\//d')
	tsconfigJSON="$(echo "$withoutComments" | sed -E 's/"moduleResolution"[^,}]*/"moduleResolution": "node"/' | sed -E '/"verbatimModuleSyntax"/d')"
    printf "%s\n" "$tsconfigJSON" > "$tsconfigPath"
	echo "TSConfig fixed"
else
    echo "TSConfig not found. Building..."
fi

echo "Building blink..."
output=$(npm run build 2>&1) && echo "$output" || echo "$output"

echo "Building blink completed"
