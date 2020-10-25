import { types as t } from '@babel/core';

// https://github.com/ModDota/API/blob/master/declarations/server/dota-enums.d.ts
const DOTA_ENUMS = new Set([
  'FindType_t',
  'DOTAConnectionState_t',
  'AbilityLearnResult_t',
  'AttributeDerivedStats',
  'Attributes',
  'DAMAGE_TYPES',
  'DOTAAbilitySpeakTrigger_t',
  'DOTADamageFlag_t',
  'DOTAHUDVisibility_t',
  'DOTAInventoryFlags_t',
  'DOTALimits_t',
  'DOTAMinimapEvent_t',
  'DOTAModifierAttribute_t',
  'DOTAMusicStatus_t',
  'DOTAProjectileAttachment_t',
  'DOTAScriptInventorySlot_t',
  'DOTASlotType_t',
  'DOTASpeechType_t',
  'DOTATeam_t',
  'DOTAUnitAttackCapability_t',
  'DOTAUnitMoveCapability_t',
  'DOTA_ABILITY_BEHAVIOR',
  'DOTA_GameState',
  'DOTA_HeroPickState',
  'DOTA_MOTION_CONTROLLER_PRIORITY',
  'DOTA_RUNES',
  'DOTA_SHOP_TYPE',
  'DOTA_UNIT_TARGET_FLAGS',
  'DOTA_UNIT_TARGET_TEAM',
  'DOTA_UNIT_TARGET_TYPE',
  'DamageCategory_t',
  'DotaDefaultUIElement_t',
  'EDOTA_ModifyGold_Reason',
  'EDOTA_ModifyXP_Reason',
  'EShareAbility',
  'GameActivity_t',
  'LuaModifierType',
  'ParticleAttachment_t',
  'UnitFilterResult',
  'attackfail',
  'modifierfunction',
  'modifierpriority',
  'modifierremove',
  'modifierstate',
  'quest_text_replace_values_t',
  'subquest_text_replace_values_t',
  'DotaUnitOrder_t',
  'OverheadAlerts_t',
]);

export default function() {
  return {
    visitor: {
      MemberExpression(path) {
        const { node } = path;
        if (!DOTA_ENUMS.has(node.object.name)) return;

        if (node.computed) {
          const newNode = t.cloneNode(node);
          newNode.object = t.identifier('global');
          path.replaceWith(newNode);
        } else {
          path.replaceWith(t.cloneNode(node.property));
        }
      },
    },
  };
}
