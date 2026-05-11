const devicons: Record<string, string> = {
	JavaScript: 'javascript/javascript-original',
	TypeScript: 'typescript/typescript-original',
	Python: 'python/python-original',
	Java: 'java/java-original',
	'C++': 'cplusplus/cplusplus-original',
	C: 'c/c-original',
	'C#': 'csharp/csharp-original',
	Go: 'go/go-original-wordmark',
	Rust: 'rust/rust-original',
	Ruby: 'ruby/ruby-original',
	PHP: 'php/php-original',
	Swift: 'swift/swift-original',
	Kotlin: 'kotlin/kotlin-original',
	Dart: 'dart/dart-original',
	Scala: 'scala/scala-original',
	Shell: 'bash/bash-original',
	Lua: 'lua/lua-original',
	Perl: 'perl/perl-original',
	R: 'r/r-original',
	Julia: 'julia/julia-original',
	Haskell: 'haskell/haskell-original',
	Elixir: 'elixir/elixir-original',
	Clojure: 'clojure/clojure-original',
	Erlang: 'erlang/erlang-original',
	'Objective-C': 'objectivec/objectivec-plain',
	HTML: 'html5/html5-original',
	CSS: 'css3/css3-original',
	SCSS: 'sass/sass-original',
	Vue: 'vuejs/vuejs-original',
	Svelte: 'svelte/svelte-original',
	Dockerfile: 'docker/docker-original',
	Nix: 'nixos/nixos-original',
	Terraform: 'terraform/terraform-original',
	PowerShell: 'powershell/powershell-original',
	TeX: 'latex/latex-original',
	Jupyter: 'jupyter/jupyter-original',
	OCaml: 'ocaml/ocaml-original',
	'F#': 'fsharp/fsharp-original',
	Groovy: 'groovy/groovy-original',
	CoffeeScript: 'coffeescript/coffeescript-original',
	Crystal: 'crystal/crystal-original',
	Zig: 'zig/zig-original',
	Nim: 'nimble/nimble-original',
	Solidity: 'solidity/solidity-original'
};

const CDN = 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons';

export function getLanguageIcon(lang: string): string | null {
	const path = devicons[lang];
	if (!path) return null;
	return `${CDN}/${path}.svg`;
}
