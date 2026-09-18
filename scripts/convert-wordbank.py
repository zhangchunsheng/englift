#!/usr/bin/env python3
"""把 kajweb/dict（JSONL 词库）转换为 EngLift 词库格式。

用法：python3 scripts/convert-wordbank.py <源目录> <输出目录>
源数据：https://github.com/kajweb/dict（Gitee 镜像 gitee.com/Jeeun/english-word）
"""
import json
import glob
import os
import sys

LEVELS = {
    'xiaoxue': ('小学英语', [
        'PEPXiaoXue3_1', 'PEPXiaoXue3_2', 'PEPXiaoXue4_1', 'PEPXiaoXue4_2',
        'PEPXiaoXue5_1', 'PEPXiaoXue5_2', 'PEPXiaoXue6_1', 'PEPXiaoXue6_2',
    ]),
    'chuzhong': ('初中英语', [
        'PEPChuZhong7_1', 'PEPChuZhong7_2', 'PEPChuZhong8_1', 'PEPChuZhong8_2', 'PEPChuZhong9_1',
    ]),
    'gaozhong': ('高中英语', [f'PEPGaoZhong_{i}' for i in range(1, 12)]),
    'cet4': ('英语四级', ['CET4_3']),
    'cet6': ('英语六级', ['CET6_3']),
    'kaoyan': ('考研英语', ['KaoYan_2']),
}


def clean(s):
    return ' '.join((s or '').split())


def convert_file(path):
    words = []
    with open(path, encoding='utf-8') as f:
        for line in f:
            line = line.strip()
            if not line:
                continue
            try:
                d = json.loads(line)
            except json.JSONDecodeError:
                continue
            content = d.get('content', {}).get('word', {}).get('content', {})
            word = clean(d.get('headWord'))
            if not word:
                continue
            # 音标（优先美音）
            phone = clean(content.get('usphone') or content.get('ukphone'))
            phonetic = f'/{phone}/' if phone else ''
            # 释义：pos. 中文释义；pos2. 中文释义2
            trans = content.get('trans') or []
            parts = []
            pos = ''
            for t in trans:
                p, cn = clean(t.get('pos')), clean(t.get('tranCn'))
                if cn:
                    parts.append(f'{p}. {cn}' if p else cn)
                    if not pos and p:
                        pos = p + '.'
            if not parts:
                continue  # 没有中文释义的词跳过
            # 例句：取第一条双语例句
            example = example_zh = ''
            sentences = (content.get('sentence') or {}).get('sentences') or []
            if sentences:
                example = clean(sentences[0].get('sContent'))
                example_zh = clean(sentences[0].get('sCn'))
            words.append({
                'word': word,
                'phonetic': phonetic,
                'pos': pos,
                'meaning': '；'.join(parts),
                'example': example,
                'exampleZh': example_zh,
            })
    return words


def main(src, out):
    for level, (label, books) in LEVELS.items():
        seen = set()
        words = []
        for book in books:
            hits = glob.glob(os.path.join(src, '**', book + '.json'), recursive=True)
            if not hits:
                print(f'  ⚠ 缺少 {book}')
                continue
            for w in convert_file(hits[0]):
                key = w['word'].lower()
                if key not in seen:
                    seen.add(key)
                    words.append(w)
        data = {'level': level, 'label': label, 'words': words}
        dest = os.path.join(out, level + '.json')
        with open(dest, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, separators=(',', ':'))
        size = os.path.getsize(dest) / 1024
        print(f'  ✓ {label}: {len(words)} 词，{size:.0f} KB')


if __name__ == '__main__':
    main(sys.argv[1], sys.argv[2])
