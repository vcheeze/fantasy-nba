const { paraglide } = require("@inlang/paraglide-next/plugin")
/** @type {import('next').NextConfig} */
const nextConfig = {}

module.exports = paraglide({
	paraglide: {
		project: "./project.inlang",
		outdir: "./src/paraglide"
	},
	...nextConfig
})
