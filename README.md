# Átalányadó Kalkulátor 2026

Egyszerű, böngészőben futó kalkulátor magyar átalányadózó egyéni vállalkozóknak: megmutatja, mennyi marad egy projekt bevételéből SZJA, TB-járulék és SZOCHO levonása után.

**Élő verzió:** https://atalanyado-kalkulator.pages.dev/

## Mit tud

- Költséghányad választás: 45% / 80% / 90%
- SZJA-mentes sáv egy alatta/felette kapcsolóval (2026: 1 936 800 Ft jövedelem). A sávba eső jövedelem után SZJA, TB és szocho sem jár; ha a projekt jövedelme egymagában nagyobb a sávnál, a felette lévő részt adókötelesként számolja
- Nem ment és nem küld el adatot: minden számítás a böngészőben fut
- Fő- és mellékfoglalkozás, nyugdíjas (csak SZJA)
- Teljes SZJA-mentesség kapcsoló (pl. anyák kedvezménye, 25 év alattiak)
- Figyelmeztetés, ha a projekt egymagában átlépi a bevételi határt
- Minimum havi járulékfizetés minimálbér / garantált bérminimum alapján
- Vizuális megoszlás és tételes adóbontás

Főfoglalkozásnál a projekt TB- és szocho-összege felső becslés: a már befizetett havi minimum a negyedéves elszámolásnál beszámíthat.

## 2026-os paraméterek

| Tétel | Érték |
|---|---|
| SZJA | 15% |
| TB járulék | 18,5% |
| SZOCHO | 13% |
| Minimálbér | 322 800 Ft/hó |
| Garantált bérminimum | 373 200 Ft/hó |
| SZJA-mentes jövedelem | 1 936 800 Ft/év |
| Bevételi határ | 38 736 000 Ft (kiskereskedelem: 193 680 000 Ft) |

Az értékek a `calc.js` `TAX_RULES_2026` objektumában módosíthatók.

## Futtatás helyben

Nincs build lépés: töltsd le a mappát és nyisd meg az `index.html`-t böngészőben.

## Tesztek

A számítási logika a `calc.js`-ben van, a tesztek a `calc.test.js`-ben:

```
node --test
```

## Fontos

A kalkulátor tájékoztató jellegű, nem minősül adótanácsadásnak. Konkrét esetben fordulj könyvelőhöz, vagy nézd meg a NAV aktuális tájékoztatóit.

## Közreműködés

Hibát találtál, vagy változott egy szabály? Nyiss egy issue-t vagy pull requestet.

## Licenc

[MIT](LICENSE)
