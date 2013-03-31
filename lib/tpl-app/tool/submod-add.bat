
echo '添加应用依赖的公共库：'

git submodule add git@f2e.dp:seajs.git ./lib/seajs
git submodule add git@f2e.dp:knockout.git ./lib/knockout
git submodule add git@f2e.dp:knockout.mapping.git ./lib/knockout.mapping
git submodule add git@f2e.dp:underscore.git ./lib/underscore
git submodule add git@f2e.dp:jquery.git ./lib/jquery
git submodule add git@f2e.dp:bootstrap.git ./lib/bootstrap
git submodule add git@f2e.dp:es5-shim.git ./lib/es5-shim
git submodule add git@f2e.dp:json.git ./lib/json
git submodule add git@f2e.dp:hash-change.git ./lib/hash-change
git submodule add git@f2e.dp:crystal.git ./lib/crystal

echo '添加应用依赖的公共库完成！'

