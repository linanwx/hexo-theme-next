'use strict';

const { join } = require('path').posix;

class TreeNode {
  constructor(parent, path, name, icon) {
    if (parent && !path.startsWith('http')) {
      path = join(parent.path, path);
    }
    this.parent = parent;
    this.children = [];
    this.path = path;
    this.name = name;
    this.icon = icon;
  }

  append(child) {
    this.children.push(child);
  }
}

module.exports = hexo => {
  const menu_map = new Map();
  const main_menu = [];
  const zh_CN_menu = []; // 增加 zh_CN_menu 以保存中文菜单
  hexo.theme.config.menu_map = menu_map;
  hexo.theme.config.main_menu = main_menu;
  hexo.theme.config.zh_CN_menu = zh_CN_menu; // 将 zh_CN_menu 保存到 hexo.theme.config 中

  function parse(menu, parent, menu_array) {
    if (!menu) return;
    Object.entries(menu).forEach(([name, value]) => {
      if (name.toLowerCase() === 'default') return;
      let node;
      if (typeof value === 'string') {
        const [path, icon] = value.split('||').map(v => v.trim());
        node = new TreeNode(parent, path, name, icon);
      } else if (typeof value === 'object') {
        if (typeof value.default !== 'string') {
          hexo.log.warn('Missing default entry for menu item:', name);
          return;
        }
        const [path, icon] = value.default.split('||').map(v => v.trim());
        node = new TreeNode(parent, path, name, icon);
        parse(value, node, menu_array);
      }
      if (node) {
        menu_map.set(node.path, node);
        if (parent) {
          parent.append(node);
        } else {
          menu_array.push(node); // 根据传入的菜单数组保存到相应的菜单中
        }
      }
    });
  }

  parse(hexo.theme.config.menu, null, main_menu);
  parse(hexo.theme.config.menu_zh_CN, null, zh_CN_menu); // 同样解析中文菜单
};
