import VueI18n from 'vue-i18n'
import Vue from 'vue'
import { ava } from '@/AVA'

Vue.use(VueI18n)

import en from '../locales/en.json'
import fr from '../locales/fr.json'
import tr from '../locales/tr.json'
import it from '../locales/it.json'
import es from '../locales/es.json'
import de from '../locales/de.json'
import kr from '../locales/kr.json'
import ru from '../locales/ru.json'
import zh_hant from '../locales/zh_hant.json'
import zh_hans from '../locales/zh_hans.json'
import pt from '../locales/pt.json'
import vn from '../locales/vn.json'
import nl from '../locales/nl.json'
import uk from '../locales/uk.json'
import ca from '../locales/ca.json'
import cs from '../locales/cs.json'
import af from '../locales/aafrikans.json'
import ar from '../locales/arabic.json'
import da from '../locales/danish.json'
import fi from '../locales/finnish.json'
import el from '../locales/greek.json'
import he from '../locales/hebrew.json'
import hu from '../locales/hungarian.json'
import nb from '../locales/norwegian.json'
import pl from '../locales/polish.json'
import ro from '../locales/romanian.json'
import sr from '../locales/serbian.json'
import sv from '../locales/swedish.json'
import th from '../locales/thai.json'
import ja from '../locales/japanese.json'

const messages = {
    en,
    fr,
    tr,
    it,
    es,
    de,
    kr,
    ru,
    zh_hant,
    zh_hans,
    pt,
    vn,
    nl,
    uk,
    ca,
    cs,
    af,
    ar,
    da,
    fi,
    el,
    he,
    hu,
    nb,
    pl,
    ro,
    sr,
    sv,
    th,
    ja,
}

const modifiers = {
    native: () => ava.getPrimaryAssetAlias(),
    project: () => 'Camino',
}

// Create VueI18n instance with options
const i18n = new VueI18n({
    locale: 'en', // set locale
    fallbackLocale: 'en',
    silentFallbackWarn: true,
    silentTranslationWarn: true,
    messages, // set locale messages
    modifiers,
})

export default i18n
