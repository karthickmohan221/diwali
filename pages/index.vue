<script setup lang="ts">
import { encodeSenderName } from '~/utils/greeting'

await navigateTo(`/w/${encodeSenderName('skylink.in')}`, { redirectCode: 302 })
</script>
