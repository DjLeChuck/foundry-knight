import {
  getEffets,
  getAspectValue,
  getAEValue,
  listEffects,
  SortByName,
  addOrUpdateEffect,
  updateEffect,
  existEffect,
  confirmationDialog,
  getFlatEffectBonus,
  effectsGestion,
  getDefaultImg,
  diceHover,
  options,
  commonPNJ,
  hideShowLimited,
  dragMacro,
} from "../../helpers/common.mjs";

import {
  dialogRoll,
  actualiseRoll,
} from "../../helpers/dialogRoll.mjs";

import toggler from '../../helpers/toggler.js';

const path = {
  espoir:{
    bonus:'system.espoir.bonusValue',
    malus:'system.espoir.malusValue',
  },
  sante:{
    bonus:'system.sante.bonusValue',
    malus:'system.sante.malusValue',
  },
  reaction:{
    bonus:'system.reaction.bonusValue',
    malus:'system.reaction.malusValue',
  },
  defense:{
    bonus:'system.defense.bonusValue',
    malus:'system.defense.malusValue',
  },
  armure:{
    bonus:'system.armure.bonusValue',
    malus:'system.armure.malusValue',
  },
  energie:{
    bonus:'system.energie.bonusValue',
    malus:'system.energie.malusValue',
  },
  champDeForce:{
    base:'system.champDeForce.base',
    bonus:'system.champDeForce.bonusValue',
    malus:'system.champDeForce.malusValue',
  },
};

const caracToAspect = {
  'deplacement':'chair',
  'force':'chair',
  'endurance':'chair',
  'hargne':'bete',
  'combat':'bete',
  'instinct':'bete',
  'tir':'machine',
  'savoir':'machine',
  'technique':'machine',
  'aura':'dame',
  'parole':'dame',
  'sangFroid':'dame',
  'discretion':'masque',
  'dexterite':'masque',
  'perception':'masque'
};

/**
 * @extends {ActorSheet}
 */
export class PNJSheet extends ActorSheet {

  /** @inheritdoc */
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ["pnj", "sheet", "actor"],
      template: "systems/knight/templates/actors/pnj-sheet.html",
      width: 900,
      height: 780,
      tabs: [{navSelector: ".sheet-tabs", contentSelector: ".body", initial: "description"}],
      dragDrop: [{dragSelector: [".draggable", ".item-list .item"], dropSelector: null}],
    });
  }

  /* -------------------------------------------- */

  /** @inheritdoc */
  getData() {
    const context = super.getData();
    const options = context.data.system.options;
    const noFirstMenu = !options.resilience && !options.sante && !options.espoir ? true : false;
    const noSecondMenu = !options.armure && !options.energie && !options.bouclier && !options.champDeForce ? true : false;

    options.noFirstMenu = noFirstMenu;
    options.noSecondMenu = noSecondMenu;

    this._prepareCharacterItems(context);
    this._prepareAE(context);
    this._prepareTranslation(context.actor, context.data.system);
    context.data.system.wear = 'armure';

    context.systemData = context.data.system;

    actualiseRoll(this.actor);

    console.warn(context);

    return context;
  }

  /**
     * Return a light sheet if in "limited" state
     * @override
     */
   get template() {
    if (!game.user.isGM && this.actor.limited) {
      return "systems/knight/templates/actors/limited-sheet.html";
    }
    return this.options.template;
  }

  /* -------------------------------------------- */

  /** @inheritdoc */
  activateListeners(html) {
    super.activateListeners(html);

    toggler.init(this.id, html);

    html.find('div.grenades img.info').click(ev => {
      const span = $(ev.currentTarget).siblings("span.hideInfo")
      span.width($(html).width()/2).toggle("display");
      $(ev.currentTarget).toggleClass("clicked")
    });

    html.find('div.combat div.armesContact img.info').click(ev => {
      const span = $(ev.currentTarget).siblings("span.hideInfo")
      const width = $(ev.currentTarget).parents("div.main").width() / 2;
      const isW50 = $(ev.currentTarget).parents("div.wpn").width();
      let position = "";
      let borderRadius = "border-top-right-radius";

      if(isW50 <= width) {
        if($(ev.currentTarget).parents("div.wpn").position().left > width) {
          position = "right";
          borderRadius = "border-top-right-radius";
        } else {
          position = "left";
          borderRadius = "border-top-left-radius";
        }
      } else {
        if($(ev.currentTarget).parent().position().left > width) {
          position = "right";
          borderRadius = "border-top-right-radius";
        } else {
          position = "left";
          borderRadius = "border-top-left-radius";
        }
      }

      span.width($(html).width()/2).css(position, "0px").css(borderRadius, "0px").toggle("display");
      $(ev.currentTarget).toggleClass("clicked");
    });

    html.find('div.combat div.armesDistance img.info').click(ev => {
      const span = $(ev.currentTarget).siblings("span.hideInfo")
      const width = $(ev.currentTarget).parents("div.main").width() / 2;
      const isW50 = $(ev.currentTarget).parents("div.wpn").width();
      let position = "";
      let borderRadius = "border-top-right-radius";

      if(isW50 <= width) {
        if($(ev.currentTarget).parents("div.wpn").position().left > width) {
          position = "right";
          borderRadius = "border-top-right-radius";
        } else {
          position = "left";
          borderRadius = "border-top-left-radius";
        }
      } else {
        if($(ev.currentTarget).parent().position().left > width) {
          position = "right";
          borderRadius = "border-top-right-radius";
        } else {
          position = "left";
          borderRadius = "border-top-left-radius";
        }
      }

      span.width($(html).width()/2).css(position, "0px").css(borderRadius, "0px").toggle("display");
      $(ev.currentTarget).toggleClass("clicked");
    });

    html.find('div.bCapacite img.info').click(ev => {
      const span = $(ev.currentTarget).siblings("span.hideInfo")
      const width = $(ev.currentTarget).parents("div.mainBlock").width() / 2;
      const isW50 = $(ev.currentTarget).parents("div.data").width();
      let position = "";
      let borderRadius = "border-top-right-radius";

      if(isW50 <= width) {
        if($(ev.currentTarget).parents("div.data").position().left > width) {
          position = "right";
          borderRadius = "border-top-right-radius";
        } else {
          position = "left";
          borderRadius = "border-top-left-radius";
        }
      } else {
        if($(ev.currentTarget).parent().position().left > width) {
          position = "right";
          borderRadius = "border-top-right-radius";
        } else {
          position = "left";
          borderRadius = "border-top-left-radius";
        }
      }

      span.width($(html).width()/2).css(position, "0px").css(borderRadius, "0px").toggle("display");
      $(ev.currentTarget).toggleClass("clicked");
    });

    hideShowLimited(this.actor, html);

    // Everything below here is only needed if the sheet is editable
    if ( !this.isEditable ) return;

    diceHover(html);
    options(html, this.actor);
    commonPNJ(html, this.actor);

    html.find('.item-create').click(this._onItemCreate.bind(this));

    html.find('.item-edit').click(ev => {
      const header = $(ev.currentTarget).parents(".summary");
      const item = this.actor.items.get(header.data("item-id"));

      item.sheet.render(true);
    });

    html.find('.item-delete').click(async ev => {
      const header = $(ev.currentTarget).parents(".summary");
      const item = this.actor.items.get(header.data("item-id"));

      if(!await confirmationDialog()) return;

      if(item.type === 'armure') {
        const listEffect = this.actor.getEmbeddedCollection('ActiveEffect');
        const listCapacitesEffects = ['ascension', 'companions', 'shrine', 'goliath', 'rage', 'esquive', 'force', 'legendcompanions', 'legendshrine', 'legendgoliath', 'legendwarlord', 'capaciteUltime'];
        const toUpdate = [];

        for(const capacite of listCapacitesEffects) {
          const effectExist = existEffect(listEffect, capacite);

          if(effectExist !== undefined) {
            toUpdate.push({
              "_id":effectExist._id,
              disabled:true
            });
          }
        }

        if(toUpdate.length > 0) updateEffect(this.actor, toUpdate);
        this.actor.update({['system.equipements.armure.id']:0});
      }

      item.delete();
      header.slideUp(200, () => this.render(false));
    });

    html.find('div.combat div.armesContact select.wpnMainChange').change(ev => {
      const target = $(ev.currentTarget);
      const id = target.data("id");
      const value = target.val();

      this.actor.items.get(id).update({['system.options2mains.actuel']:value});
    });

    html.find('div.combat div.armesDistance select.wpnMunitionChange').change(ev => {
      const target = $(ev.currentTarget);
      const id = target.data("id");
      const niveau = target.data("niveau");
      const value = target.val();
      const item = this.actor.items.get(id);

      if(item.type === 'module') {
        item.update({[`system.niveau.details.n${niveau}.arme.optionsmunitions.actuel`]:value});
      } else {
        item.update({['system.optionsmunitions.actuel']:value});
      }
    });

    html.find('div.combat button.addbasechair').click(ev => {
      const target = $(ev.currentTarget);
      const id = target.data("id");
      const value = target?.data("value") || false;
      let result = true;

      if(value) result = false;

      this.actor.items.get(id).update({['system.degats.addchair']:result});
    });

    html.find('.capacites div.armure .activation').click(async ev => {
      const target = $(ev.currentTarget);
      const name = target.data('name');
      const cout = eval(target.data('cout'));
      const toupdate = target.data('toupdate');
      const value = target.data('value') ? false : true;
      const capacite = target.data('capacite');
      const variant = target.data("variant");
      const isAllie = target.data("isallie");
      const nbreC = target.data("nbrec") || 0;
      const special = target.data("special");
      const caracteristiques = target.data("caracteristiques")?.split('.')?.filter((a) => a) || false;

      const getData = this.getData();
      const system = getData.data.system;
      const options = system.options;

      const actor = this.actor;
      const listEffect = actor.getEmbeddedCollection('ActiveEffect');
      const equipcapacites = system.equipements.armure.capacites;
      const armorCapacites = actor.armureData.system.capacites.selected;
      const armure = actor.items.get(system.equipements.armure.id);
      const remplaceEnergie = armure.system.espoir.remplaceEnergie || false;

      const espoir = system.espoir;

      const effect = [];
      const update = {};
      const specialUpdate = {};
      let quelMalus = false;

      if(remplaceEnergie && options.espoir && value) {
        const espoirValue = espoir.value;
        const espoirNew = espoirValue-cout;

        quelMalus = 'espoir';

        if(espoirNew < 0) {
          const msgEspoir = {
            flavor:`${label}`,
            main:{
              total:`${game.i18n.localize('KNIGHT.JETS.Notespoir')}`
            }
          };

          const msgEspoirData = {
            user: game.user.id,
            speaker: {
              actor: this.actor?.id || null,
              token: this.actor?.token?.id || null,
              alias: this.actor?.name || null,
            },
            type: CONST.CHAT_MESSAGE_TYPES.OTHER,
            content: await renderTemplate('systems/knight/templates/dices/wpn.html', msgEspoir),
            sound: CONFIG.sounds.dice
          };

          const rMode = game.settings.get("core", "rollMode");
          const msgFData = ChatMessage.applyRollMode(msgEspoirData, rMode);

          await ChatMessage.create(msgFData, {
            rollMode:rMode
          });

          return;
        }

        specialUpdate['system.espoir.value'] = espoirNew;
      } else if(options.energie && value) {

        const depense = this._depensePE(cout);

        quelMalus = 'energie';

        if(!depense) {
          const msgEnergie = {
            flavor:`${label}`,
            main:{
              total:`${game.i18n.localize('KNIGHT.JETS.Notenergie')}`
            }
          };

          const msgEnergieData = {
            user: game.user.id,
            speaker: {
              actor: this.actor?.id || null,
              token: this.actor?.token?.id || null,
              alias: this.actor?.name || null,
            },
            type: CONST.CHAT_MESSAGE_TYPES.OTHER,
            content: await renderTemplate('systems/knight/templates/dices/wpn.html', msgEnergie),
            sound: CONFIG.sounds.dice
          };

          const rMode = game.settings.get("core", "rollMode");
          const msgFData = ChatMessage.applyRollMode(msgEnergieData, rMode);

          await ChatMessage.create(msgFData, {
            rollMode:rMode
          });

          return;
        }
      }

      let effectExist = existEffect(listEffect, capacite);

      let depenseEspoir;
      let newActor;

      switch(capacite) {
        case "ascension":
            if(value) {
              let data = system;
              data.energie.value = cout;

              let newItems = getData.items.filter(items => items.system.rarete !== 'prestige');

              newActor = await Actor.create({
                name: `${name} : ${this.title}`,
                type: "pnj",
                img:armure.img,
                items:newItems,
                system:data,
                permission:this.actor.ownership,
                folder:this.actor.folder
              });

              armure.update({[`system.${toupdate}`]:{
                active:true,
                depense:cout,
                ascensionId:newActor.id
              }});

              if(quelMalus !== false) {
                effect.push({
                  key: path[quelMalus].malus,
                  mode: 2,
                  priority: null,
                  value: cout
                });

                addOrUpdateEffect(this.actor, capacite, effect);
              }

            } else {
              const actor = game.actors.get(id);

              if(actor !== undefined) await actor.delete();

              armure.update({[`system.${toupdate}`]:{
                active:false,
                ascensionId:0,
                depense:0
              }});

              updateEffect(this.actor, [{
                "_id":effectExist._id,
                disabled:true
              }]);
            }
            break;
        case "borealis":
          armure.update({[`system.${toupdate}`]:value});
          break;
        case "changeling":
          armure.update({[`system.${toupdate}`]:value});
          break;
        case "companions":
          update[`system.${toupdate}.base`] = value;
          update[`system.${toupdate}.${special}`] = value;

          if(value) {
            effect.push({
              key: path[quelMalus].malus,
              mode: 2,
              priority: null,
              value: retrieve
            });

            addOrUpdateEffect(this.actor, capacite, effect);

            switch(special) {
              case 'lion':
                const dataLion = armorCapacites.companions.lion;

                const dataLChair = dataLion.aspects.chair;
                const dataLBete = dataLion.aspects.bete;
                const dataLMachine = dataLion.aspects.machine;
                const dataLDame = dataLion.aspects.dame;
                const dataLMasque = dataLion.aspects.masque;

                const lionAEChairMin = dataLChair.ae > 4 ? 0 : dataLChair.ae;
                const lionAEChairMaj = dataLChair.ae < 5 ? 0 : dataLChair.ae;

                const lionAEBeteMin = dataLBete.ae > 4 ? 0 : dataLBete.ae;
                const lionAEBeteMaj = dataLBete.ae < 5 ? 0 : dataLBete.ae;

                const lionAEMachineMin = dataLMachine.ae > 4 ? 0 : dataLMachine.ae;
                const lionAEMachineMaj = dataLMachine.ae < 5 ? 0 : dataLMachine.ae;

                const lionAEDameMin = dataLDame.ae > 4 ? 0 : dataLDame.ae;
                const lionAEDameMaj = dataLDame.ae < 5 ? 0 : dataLDame.ae;

                const lionAEMasqueMin = dataLMasque.ae > 4 ? 0 : dataLMasque.ae;
                const lionAEMasqueMaj = dataLMasque.ae < 5 ? 0 : dataLMasque.ae;

                newActor = await Actor.create({
                  name: `${this.title} : ${game.i18n.localize("KNIGHT.ITEMS.ARMURE.CAPACITES.COMPANIONS.LION.Label")}`,
                  type: "pnj",
                  img:dataLion.img,
                  system:{
                    "aspects": {
                      "chair":{
                        "value":dataLChair.value,
                        "ae":{
                          "mineur":{
                            "value":lionAEChairMin
                          },
                          "majeur":{
                            "value":lionAEChairMaj
                          }
                        }
                      },
                      "bete":{
                        "value":dataLBete.value,
                        "ae":{
                          "mineur":{
                            "value":lionAEBeteMin
                          },
                          "majeur":{
                            "value":lionAEBeteMaj
                          }
                        }
                      },
                      "machine":{
                        "value":dataLMachine.value,
                        "ae":{
                          "mineur":{
                            "value":lionAEMachineMin
                          },
                          "majeur":{
                            "value":lionAEMachineMaj
                          }
                        }
                      },
                      "dame":{
                        "value":dataLDame.value,
                        "ae":{
                          "mineur":{
                            "value":lionAEDameMin
                          },
                          "majeur":{
                            "value":lionAEDameMaj
                          }
                        }
                      },
                      "masque":{
                        "value":dataLMasque.value,
                        "ae":{
                          "mineur":{
                            "value":lionAEMasqueMin
                          },
                          "majeur":{
                            "value":lionAEMasqueMaj
                          }
                        }
                      }
                    },
                    "energie":{
                      "base":retrieve,
                      "value":retrieve,
                    },
                    "champDeForce":{
                      "base":dataLion.champDeForce.base,
                    },
                    "armure":{
                      "value":dataLion.armure.value,
                      "base":dataLion.armure.base
                    },
                    "initiative":{
                      "diceBase":dataLion.initiative.value,
                      "bonus":{
                        "user":dataLion.initiative.fixe,
                      }
                    },
                    "defense":{
                      "base":dataLion.defense.value
                    },
                    "reaction":{
                      "base":dataLion.reaction.value
                    },
                    "options":{
                      "resilience":false,
                      "sante":false,
                      "espoir":false,
                      "bouclier":false,
                      "noCapacites":true,
                      "modules":true,
                      "phase2":false
                    }
                  },
                  items:dataLion.modules,
                  folder:this.actor.folder,
                  permission:this.actor.ownership
                });

                const nLItems = [];

                const nLItem = {
                  name:dataLion.armes.contact.coups.label,
                  type:'arme',
                  system:{
                    type:'contact',
                    portee:dataLion.armes.contact.coups.portee,
                    degats:{
                      dice:dataLion.armes.contact.coups.degats.dice,
                      fixe:dataLion.armes.contact.coups.degats.fixe
                    },
                    violence:{
                      dice:dataLion.armes.contact.coups.violence.dice,
                      fixe:dataLion.armes.contact.coups.violence.fixe
                    },
                    effets:{
                      raw:dataLion.armes.contact.coups.effets.raw,
                      custom:dataLion.armes.contact.coups.effets.custom
                    }
                }};

                nLItems.push(nLItem);

                await newActor.createEmbeddedDocuments("Item", nLItems);

                update[`system.capacites.selected.companions.lion.id`] = newActor.id
                break;

              case 'wolf':
                let newActor2;
                let newActor3;

                const dataWolf = armorCapacites.companions.wolf;

                const dataWChair = dataWolf.aspects.chair;
                const dataWBete = dataWolf.aspects.bete;
                const dataWMachine = dataWolf.aspects.machine;
                const dataWDame = dataWolf.aspects.dame;
                const dataWMasque = dataWolf.aspects.masque;

                const dataActor = {
                  "aspects": {
                    "chair":{
                      "value":dataWChair.value
                    },
                    "bete":{
                      "value":dataWBete.value
                    },
                    "machine":{
                      "value":dataWMachine.value
                    },
                    "dame":{
                      "value":dataWDame.value
                    },
                    "masque":{
                      "value":dataWMasque.value
                    }
                  },
                  "energie":{
                    "base":retrieve,
                    "value":retrieve,
                  },
                  "champDeForce":{
                    "base":dataWolf.champDeForce.base,
                  },
                  "armure":{
                    "value":dataWolf.armure.base,
                    "base":dataWolf.armure.base
                  },
                  "initiative":{
                    "diceBase":dataWolf.initiative.value,
                    "bonus":{
                      "user":dataWolf.initiative.fixe,
                    }
                  },
                  "defense":{
                    "base":dataWolf.defense.base
                  },
                  "reaction":{
                    "base":dataWolf.reaction.base
                  },
                  "wolf":dataWolf.configurations,
                  "configurationActive":'',
                  "options":{
                    "resilience":false,
                    "sante":false,
                    "espoir":false,
                    "bouclier":false,
                    "modules":false,
                    "noCapacites":true,
                    "wolfConfiguration":true
                  }
                };

                newActor = await Actor.create({
                  name: `${this.title} : ${game.i18n.localize("KNIGHT.ITEMS.ARMURE.CAPACITES.COMPANIONS.WOLF.Label")} 1`,
                  type: "pnj",
                  img:dataWolf.img,
                  system:dataActor,
                  folder:this.actor.folder,
                  permission:this.actor.ownership
                });

                newActor2 = await Actor.create({
                  name: `${this.title} : ${game.i18n.localize("KNIGHT.ITEMS.ARMURE.CAPACITES.COMPANIONS.WOLF.Label")} 2`,
                  type: "pnj",
                  img:dataWolf.img,
                  system:dataActor,
                  folder:this.actor.folder,
                  permission:this.actor.ownership
                });

                newActor3 = await Actor.create({
                  name: `${this.title} : ${game.i18n.localize("KNIGHT.ITEMS.ARMURE.CAPACITES.COMPANIONS.WOLF.Label")} 3`,
                  type: "pnj",
                  img:dataWolf.img,
                  system:dataActor,
                  folder:this.actor.folder,
                  permission:this.actor.ownership
                });

                const nWItems = [];

                const nWItem = {
                  name:dataWolf.armes.contact.coups.label,
                  type:'arme',
                  system:{
                    type:'contact',
                    portee:dataWolf.armes.contact.coups.portee,
                    degats:{
                      dice:dataWolf.armes.contact.coups.degats.dice,
                      fixe:dataWolf.armes.contact.coups.degats.fixe
                    },
                    violence:{
                      dice:dataWolf.armes.contact.coups.violence.dice,
                      fixe:dataWolf.armes.contact.coups.violence.fixe
                    },
                    effets:{
                      raw:dataWolf.armes.contact.coups.effets.raw,
                      custom:dataWolf.armes.contact.coups.effets.custom
                    }
                }};

                nWItems.push(nWItem);

                await newActor.createEmbeddedDocuments("Item", nWItems);
                await newActor2.createEmbeddedDocuments("Item", nWItems);
                await newActor3.createEmbeddedDocuments("Item", nWItems);

                update[`system.capacites.selected.companions.wolf.id`] = {
                  id1:newActor.id,
                  id2:newActor2.id,
                  id3:newActor3.id
                };
                break;

              case 'crow':
                const dataCrow = armorCapacites.companions.crow;

                const dataCChair = dataCrow.aspects.chair;
                const dataCBete = dataCrow.aspects.bete;
                const dataCMachine = dataCrow.aspects.machine;
                const dataCDame = dataCrow.aspects.dame;
                const dataCMasque = dataCrow.aspects.masque;

                newActor = await Actor.create({
                  name: `${this.title} : ${game.i18n.localize("KNIGHT.ITEMS.ARMURE.CAPACITES.COMPANIONS.CROW.Label")}`,
                  type: "bande",
                  img:dataCrow.img,
                  system:{
                    "aspects": {
                      "chair":{
                        "value":dataCChair.value
                      },
                      "bete":{
                        "value":dataCBete.value
                      },
                      "machine":{
                        "value":dataCMachine.value
                      },
                      "dame":{
                        "value":dataCDame.value
                      },
                      "masque":{
                        "value":dataCMasque.value
                      }
                    },
                    "energie":{
                      "value":retrieve,
                      "max":retrieve,
                    },
                    "champDeForce":{
                      "base":dataCrow.champDeForce.base,
                    },
                    "sante":{
                      "value":dataCrow.cohesion.base,
                      "base":dataCrow.cohesion.base
                    },
                    "initiative":{
                      "diceBase":dataCrow.initiative.value,
                      "bonus":{
                        "user":dataCrow.initiative.fixe,
                      }
                    },
                    "defense":{
                      "base":dataCrow.defense.value
                    },
                    "reaction":{
                      "base":dataCrow.reaction.value
                    },
                    "debordement":{
                      "value":dataCrow.debordement.base
                    },
                    "options":{
                      "resilience":false,
                      "sante":false,
                      "espoir":false,
                      "bouclier":false,
                      "noCapacites":true,
                      "energie":true,
                      "modules":false
                    }
                  },
                  folder:this.actor.folder,
                  permission:this.actor.ownership
                });

                update[`system.capacites.selected.companions.crow.id`] = newActor.id;
                break;
            }
          } else {
            updateEffect(this.actor, [{
              "_id":effectExist._id,
              disabled:true
            }]);

            switch(special) {
              case 'lion':
                const idLion = armorCapacites.companions.lion.id;
                const actorLion = game.actors.get(idLion);

                this._gainPE(actorLion.system.energie.value, true);

                await actorLion.delete();
                break;

              case 'wolf':
                const id1Wolf = armorCapacites.companions.wolf.id.id1;
                const id2Wolf = armorCapacites.companions.wolf.id.id2;
                const id3Wolf = armorCapacites.companions.wolf.id.id3;
                const actor1Wolf = game.actors.get(id1Wolf);
                const actor2Wolf = game.actors.get(id2Wolf);
                const actor3Wolf = game.actors.get(id3Wolf);

                this._gainPE(actor1Wolf.system.energie.value, true);

                await actor1Wolf.delete();
                await actor2Wolf.delete();
                await actor3Wolf.delete();
                break;

              case 'crow':
                const idCrow = armorCapacites.companions.crow.id;
                const actorCrow = game.actors.get(idCrow);

                this._gainPE(actorCrow.system.energie.value, true);

                await actorCrow.delete();
                break;
            }
          }

          armure.update(update);
          break;
        case "shrine":
          if(special === 'personnel' && value) {
            effect.push({
              key: path.champDeForce.bonus,
              mode: 2,
              priority: null,
              value: armorCapacites.shrine.champdeforce
            });

            addOrUpdateEffect(this.actor, capacite, effect);
          }
          else if(special === 'personnel' && !value) updateEffect(this.actor, [{
            "_id":effectExist._id,
            disabled:true
          }]);

          update[`system.${toupdate}.base`] = value;
          update[`system.${toupdate}.${special}`] = value;

          armure.update(update);
          break;
        case "ghost":
          armure.update({[`system.${toupdate}.${special}`]:value});
          break;
        case "goliath":
          const eGoliath = equipcapacites.goliath;
          const aGoliath = armorCapacites.goliath;

          const goliathMetre = +eGoliath.metre;
          const bGCDF = aGoliath.bonus.cdf.value;
          const mGRea = aGoliath.malus.reaction.value;
          const mGDef = aGoliath.malus.defense.value;

          if(value) {
            effect.push({
              key: path.reaction.malus,
              mode: 2,
              priority: null,
              value: goliathMetre*mGRea
            },
            {
              key: path.defense.malus,
              mode: 2,
              priority: null,
              value: goliathMetre*mGDef
            },
            {
              key: path.champDeForce.bonus,
              mode: 2,
              priority: null,
              value: goliathMetre*bGCDF
            });

            addOrUpdateEffect(this.actor, capacite, effect);
          } else {
            updateEffect(this.actor, [{
              "_id":effectExist._id,
              disabled:true
            }]);
          }

          armure.update({[`system.${toupdate}`]:value});
          break;
        case "illumination":
          switch(special) {
            case "torch":
            case "lighthouse":
            case "lantern":
            case "blaze":
            case "beacon":
            case "projector":
              if(options.espoir && value) {
                const espoirValue = espoir.value;
                const espoirNew = espoirValue-espoir;

                if(espoirNew < 0) {
                  const msgEspoir = {
                    flavor:`${label}`,
                    main:{
                      total:`${game.i18n.localize('KNIGHT.JETS.Notespoir')}`
                    }
                  };

                  const msgEspoirData = {
                    user: game.user.id,
                    speaker: {
                      actor: this.actor?.id || null,
                      token: this.actor?.token?.id || null,
                      alias: this.actor?.name || null,
                    },
                    type: CONST.CHAT_MESSAGE_TYPES.OTHER,
                    content: await renderTemplate('systems/knight/templates/dices/wpn.html', msgEspoir),
                    sound: CONFIG.sounds.dice
                  };

                  const rMode = game.settings.get("core", "rollMode");
                  const msgFData = ChatMessage.applyRollMode(msgEspoirData, rMode);

                  await ChatMessage.create(msgFData, {
                    rollMode:rMode
                  });

                  return;
                }

                this.actor.update({['system.espoir.value']:espoirNew});
              }

              armure.update({[`system.${toupdate}.${special}`]:value});
              break;

            case "candle":
              const rCandle = new game.knight.RollKnight(dEspoir, this.actor.system);
              rCandle._success = false;
              rCandle._flavor = game.i18n.localize("KNIGHT.ITEMS.ARMURE.CAPACITES.ILLUMINATION.CANDLE.SacrificeGainEspoir");
              await rCandle.toMessage({
                speaker: {
                actor: this.actor?.id || null,
                token: this.actor?.token?.id || null,
                alias: this.actor?.name || null,
                }
              });

              const espoirValue = espoir.value;
              const espoirNew = espoirValue-rCandle.total;

              specialUpdate['system.espoir.value'] = Math.max(espoirNew, 0);
              break;
          }
          break;
        case "morph":

          const nbreP = equipcapacites.morph?.poly || 0;
          const nbreA = equipcapacites.morph.nbre;
          update[`system.${toupdate}.${special}`] = value;

          if(value) {
            let label = special;
            effectExist = existEffect(listEffect, special);
            const aMorph = armorCapacites.morph;

            if(special === "polymorphieLame" || special === "polymorphieGriffe" || special === "polymorphieCanon") {
              effect.push({
                key: `system.equipements.armure.capacites.morph.poly`,
                mode: 2,
                priority: null,
                value: nbreP+1
              });

              label = "polymorphieArme";

              if(nbreP+1 === 2) update[`system.capacites.selected.morph.poly.fait`] = true;
            } else if(special === "metal") {
              const bMCDF = aMorph.metal.bonus.champDeForce;

              effect.push({
                key: path.champDeForce.bonus,
                mode: 2,
                priority: null,
                value: bMCDF
              },
              {
                key: 'system.equipements.armure.capacites.morph.nbre',
                mode: 2,
                priority: null,
                value: 1
              });
            } else if(special === "fluide") {
              const bMFLUI = aMorph.fluide.bonus;

              effect.push({
                key: path.reaction.bonus,
                mode: 2,
                priority: null,
                value: bMFLUI.reaction
              },
              {
                key: path.defense.bonus,
                mode: 2,
                priority: null,
                value: bMFLUI.defense
              },
              {
                key: 'system.equipements.armure.capacites.morph.nbre',
                mode: 2,
                priority: null,
                value: 1
              });
            } else if(special === "vol" || special === "phase" || special === "etirement" || special === "polymorphie") {
              effect.push({
                key: 'system.equipements.armure.capacites.morph.nbre',
                mode: 2,
                priority: null,
                value: 1
              });
            }

            if(effect.length > 0) addOrUpdateEffect(this.actor, label, effect);
            if(nbreA+1 === nbreC) update[`system.capacites.selected.morph.choisi.fait`] = true;
          } else {
            if(special === 'morph') {
              specialUpdate[`system.equipements.armure.capacites.morph.poly`] = 0;

              update[`system.${toupdate}.morph`] = false;
              update[`system.${toupdate}.polymorphieLame`] = false;
              update[`system.${toupdate}.polymorphieGriffe`] = false;
              update[`system.${toupdate}.polymorphieCanon`] = false;
              update[`system.capacites.selected.morph.poly.fait`] = false;
              update[`system.capacites.selected.morph.choisi.fait`] = false;
              update[`system.capacites.selected.morph.choisi.vol`] = false;
              update[`system.capacites.selected.morph.choisi.phase`] = false;
              update[`system.capacites.selected.morph.choisi.etirement`] = false;
              update[`system.capacites.selected.morph.choisi.metal`] = false;
              update[`system.capacites.selected.morph.choisi.fluide`] = false;
              update[`system.capacites.selected.morph.choisi.polymorphie`] = false;
              update[`system.capacites.selected.morph.choisi.polymorphieLame`] = false;
              update[`system.capacites.selected.morph.choisi.polymorphieGriffe`] = false;
              update[`system.capacites.selected.morph.choisi.polymorphieCanon`] = false;

              const metal = existEffect(listEffect, 'metal');
              const fluide = existEffect(listEffect, 'fluide');
              const vol = existEffect(listEffect, 'vol');
              const phase = existEffect(listEffect, 'phase');
              const etirement = existEffect(listEffect, 'etirement');
              const polymorphie = existEffect(listEffect, 'polymorphie');
              const polymorphieArme = existEffect(listEffect, 'polymorphieArme');
              const toDesactivate = [];

              if(metal) toDesactivate.push({"_id":metal._id, disabled:true});
              if(fluide) toDesactivate.push({"_id":fluide._id, disabled:true});
              if(vol) toDesactivate.push({"_id":vol._id, disabled:true});
              if(phase) toDesactivate.push({"_id":phase._id, disabled:true});
              if(etirement) toDesactivate.push({"_id":etirement._id, disabled:true});
              if(polymorphie) toDesactivate.push({"_id":polymorphie._id, disabled:true});
              if(polymorphieArme) toDesactivate.push({"_id":polymorphieArme._id, disabled:true});

              updateEffect(this.actor, toDesactivate);
            } else {
              switch(special) {
                case "polymorphieLame":
                case "polymorphieGriffe":
                case "polymorphieCanon":
                  effectExist = existEffect(listEffect, 'polymorphieArme');

                  effect.push({
                    key: `system.equipements.armure.capacites.morph.poly`,
                    mode: 2,
                    priority: null,
                    value: nbreP-1
                  });

                  updateEffect(this.actor, [{
                    "_id":effectExist._id,
                    changes:effect,
                    disabled:false
                  }]);
                  break;

                case "vol":
                case "phase":
                case "etirement":
                case "polymorphie":
                case "metal":
                case "fluide":
                  effectExist = existEffect(listEffect, special);

                  updateEffect(this.actor, [{
                    "_id":effectExist._id,
                    disabled:true
                  }]);
                  break;
              }
            }
          }

          armure.update(update);
          break;
        case "puppet":
          armure.update({[`system.${toupdate}`]:value});
          break;
        case "discord":
          armure.update({[`system.${toupdate}.${special}`]:value});
          break;
        case "rage":
          switch(special){
            case "active":
              update[`system.${toupdate}.${special}`] = value;

              if(value) update[`system.${toupdate}.niveau.colere`] = true;
              else {
                update[`system.${toupdate}.niveau.colere`] = false;
                update[`system.${toupdate}.niveau.rage`] = false;
                update[`system.${toupdate}.niveau.fureur`] = false;
              }

              if(value) {
                effect.push(
                {
                  key: path.reaction.malus,
                  mode: 2,
                  priority: null,
                  value: armorCapacites.rage.colere.reaction
                },
                {
                  key: path.defense.malus,
                  mode: 2,
                  priority: null,
                  value: armorCapacites.rage.colere.defense
                });

                addOrUpdateEffect(this.actor, capacite, effect);
              } else {
                updateEffect(this.actor, [{
                  "_id":effectExist._id,
                  disabled:true
                }]);
              }

              armure.update(update);
              break;

            case "niveau":
              const typeNiveau = target.data("niveau") || false;
              const nActuel = armure.system.capacites.selected?.rage?.niveau || false;

              if(typeNiveau === "espoir") {
                const rSEspoir = new game.knight.RollKnight("1D6", this.actor.system);
                rSEspoir._success = false;
                rSEspoir._flavor = game.i18n.localize("KNIGHT.ITEMS.ARMURE.CAPACITES.RAGE.UP.Espoir");
                await rSEspoir.toMessage({
                  speaker: {
                  actor: this.actor?.id || null,
                  token: this.actor?.token?.id || null,
                  alias: this.actor?.name || null,
                  }
                });

                const espoirValue = espoir.value;
                const espoirNew = espoirValue-rSEspoir.total;

                specialUpdate['system.espoir.value'] = Math.max(espoirNew, 0);
              }

              if(nActuel.colere) {
                update[`system.${toupdate}.niveau.colere`] = false;
                update[`system.${toupdate}.niveau.rage`] = true;

                if(value) {
                  effect.push(
                  {
                    key: path.reaction.malus,
                    mode: 2,
                    priority: null,
                    value: armorCapacites.rage.rage.reaction
                  },
                  {
                    key: path.defense.malus,
                    mode: 2,
                    priority: null,
                    value: armorCapacites.rage.rage.defense
                  });

                  addOrUpdateEffect(this.actor, capacite, effect);
                }

                specialUpdate[`system.egide.bonus.rage`] = armorCapacites.rage.rage.egide;
                specialUpdate[`system.reaction.malus.rage`] = armorCapacites.rage.rage.reaction;
                specialUpdate[`system.defense.malus.rage`] = armorCapacites.rage.rage.defense;
              }
              if(nActuel.rage) {
                update[`system.${toupdate}.niveau.colere`] = false;
                update[`system.${toupdate}.niveau.rage`] = false;
                update[`system.${toupdate}.niveau.fureur`] = true;

                if(value) {
                  effect.push(
                  {
                    key: path.reaction.malus,
                    mode: 2,
                    priority: null,
                    value: armorCapacites.rage.fureur.reaction
                  },
                  {
                    key: path.defense.malus,
                    mode: 2,
                    priority: null,
                    value: armorCapacites.rage.fureur.defense
                  });

                  addOrUpdateEffect(this.actor, capacite, effect);
                }
              }

              armure.update(update);
              break;

            case "degats":
              const degatsRage = target.data("dgts") || 0;
              const degatsLabel = target.data("label") || "";
              const sante = getData.data.system.sante.value;

              const rDgtsRage = new game.knight.RollKnight(degatsRage, this.actor.system);
              rDgtsRage._success = false;
              rDgtsRage._flavor = `${name} : ${degatsLabel}`;
              await rDgtsRage.toMessage({
                speaker: {
                actor: this.actor?.id || null,
                token: this.actor?.token?.id || null,
                alias: this.actor?.name || null,
                }
              });

              specialUpdate[`system.sante.value`] = Math.max(sante-rDgtsRage.total, 0)
            break

            case "recuperation":
              const recuperationRage = target.data("recuperation") || 0;
              const labelRecuperationRage = target.data("labelrecuperation") || "";

              const rGEspoir = new game.knight.RollKnight(recuperationRage, this.actor.system);
                rGEspoir._success = false;
                rGEspoir._flavor = game.i18n.localize("KNIGHT.GAINS.Espoir") + ` (${labelRecuperationRage})`;
                await rGEspoir.toMessage({
                  speaker: {
                  actor: this.actor?.id || null,
                  token: this.actor?.token?.id || null,
                  alias: this.actor?.name || null,
                  }
                });

              const espoirValue = espoir.value;
              const espoirMax = espoir.max;
              const espoirNew = espoirValue+rGEspoir.total;

              specialUpdate['system.espoir.value'] = Math.min(espoirNew, espoirMax);
              break;
          }
          break;
        case "record":
          armure.update({[`system.${toupdate}`]:value});
          break;
        case "totem":
          armure.update({[`system.${toupdate}`]:value});
          break;
        case "warlord":
          const aWarlord = armorCapacites.warlord.impulsions;

          if(isAllie) update[`system.${toupdate}.${special}.allie`] = value;
          else {
            update[`system.${toupdate}.${special}.porteur`] = value;
            effectExist = existEffect(listEffect, special);

              switch(special) {
                case "esquive":
                  if(value) {
                    effect.push({
                      key: path.reaction.bonus,
                      mode: 2,
                      priority: null,
                      value: aWarlord.esquive.bonus.reaction
                    },
                    {
                      key: path.defense.bonus,
                      mode: 2,
                      priority: null,
                      value: aWarlord.esquive.bonus.defense
                    });

                    addOrUpdateEffect(this.actor, special, effect);
                  } else {
                    updateEffect(this.actor, [{
                      "_id":effectExist._id,
                      disabled:true
                    }]);
                  }
                  break;

                case "force":
                  if(value) {
                    effect.push({
                      key: path.champDeForce.bonus,
                      mode: 2,
                      priority: null,
                      value: aWarlord.force.bonus.champDeForce
                    });

                    addOrUpdateEffect(this.actor, special, effect);
                  } else {
                    updateEffect(this.actor, [{
                      "_id":effectExist._id,
                      disabled:true
                    }]);
                  }
                  break;
              }
          }

          armure.update(update);
          break;
        case "watchtower":
          armure.update({[`system.${toupdate}`]:value});
          break;
        case "zen":
          dialogRoll(name, this.actor, {base:caracToAspect[caracteristiques[0]], difficulte:5});
          break;
        case "nanoc":
          armure.update({[`system.${toupdate}.${special}`]:value});
          break;
        case "type":
          armure.update({[`system.${toupdate}.${special}.${variant}`]:value});
          break;
        case "mechanic":
          const mechanic = armorCapacites[capacite].reparation[special];
          const rMechanic = new game.knight.RollKnight(`${mechanic.dice}D6+${mechanic.fixe}`, this.actor.system);
          rMechanic._success = false;
          rMechanic._flavor = `${name}`;
          await rMechanic.toMessage({
            speaker: {
            actor: this.actor?.id || null,
            token: this.actor?.token?.id || null,
            alias: this.actor?.name || null,
            }
          });
          break;
      }

      this.actor.update(specialUpdate);
    });

    html.find('.capacites div.armure .prolonger').click(async ev => {
      const capacite = $(ev.currentTarget).data("capacite");
      const special = $(ev.currentTarget).data("special");
      const cout = eval($(ev.currentTarget).data("cout"));
      const espoir = $(ev.currentTarget).data("espoir");

      const getData = this.getData();
      const system = getData.data.system;
      const options = system.options;

      this._depensePE(cout);

      switch(capacite) {
        case "illumination":
          switch(special) {
            case "torch":
            case "lighthouse":
            case "lantern":
            case "blaze":
            case "beacon":
            case "projector":
              if(options.espoir) {
                const espoirValue = espoir.value;
                const espoirNew = espoirValue-espoir;

                if(espoirNew < 0) {
                  const msgEspoir = {
                    flavor:`${label}`,
                    main:{
                      total:`${game.i18n.localize('KNIGHT.JETS.Notespoir')}`
                    }
                  };

                  const msgEspoirData = {
                    user: game.user.id,
                    speaker: {
                      actor: this.actor?.id || null,
                      token: this.actor?.token?.id || null,
                      alias: this.actor?.name || null,
                    },
                    type: CONST.CHAT_MESSAGE_TYPES.OTHER,
                    content: await renderTemplate('systems/knight/templates/dices/wpn.html', msgEspoir),
                    sound: CONFIG.sounds.dice
                  };

                  const rMode = game.settings.get("core", "rollMode");
                  const msgFData = ChatMessage.applyRollMode(msgEspoirData, rMode);

                  await ChatMessage.create(msgFData, {
                    rollMode:rMode
                  });

                  return;
                }

                this.actor.update({['system.espoir.value']:espoirNew});
              }
              break;
          }
          break;
      }
    });

    html.find('.capacites div.armure input.update').change(async ev => {
      const capacite = $(ev.currentTarget).data("capacite");
      const newV = $(ev.currentTarget).val();
      const oldV = $(ev.currentTarget).data("old");
      const cout = $(ev.currentTarget).data("cout");
      const flux = $(ev.currentTarget).data("flux") || false;

      const effect = [];

      switch(capacite) {
        case "goliath":
          const aGoliath = armorCapacites.goliath;

          const bGCDF = aGoliath.bonus.cdf.value;
          const mGRea = aGoliath.malus.reaction.value;
          const mGDef = aGoliath.malus.defense.value;

          effect.push({
            key: path.reaction.malus,
            mode: 2,
            priority: null,
            value: newV*mGRea
          },
          {
            key: path.defense.malus,
            mode: 2,
            priority: null,
            value: newV*mGDef
          },
          {
            key: path.champDeForce.bonus,
            mode: 2,
            priority: null,
            value: newV*bGCDF
          });

          addOrUpdateEffect(this.actor, capacite, effect);

          if(newV > oldV) { await this._depensePE(cout*(newV-oldV)); }
          break;
        case "puppet":
        case "totem":
        case "warlord":
          if(newV > oldV) { await this._depensePE(cout*(newV-oldV)); }
          break;
      }
    });

    html.find('.capacites div.wolf .wolfFighter').click(async ev => {
      const target = $(ev.currentTarget);
      const label = target.data('label');
      const barrage = target?.data('barrage') || false;
      const data = this.getData().systemData.wolf.fighter;

      const degats = {
        dice:data.degats,
        fixe:0
      };

      const violence = {
        dice:data.violence,
        fixe:0
      };

      const allEffets = await this._getAllEffets(data.bonus, false, false);

      if(barrage) {
        const barrageLabel = `${game.i18n.localize('KNIGHT.EFFETS.BARRAGE.Label')} ${allEffets.barrageValue}`;
        const pAttack = {
          flavor:`${label} : ${game.i18n.localize('KNIGHT.AUTRE.Attaque')}`,
          main:{
            total:barrageLabel
          }
        };

        const attackMsgData = {
          user: game.user.id,
          speaker: {
            actor: this.actor?.id || null,
            token: this.actor?.token?.id || null,
            alias: this.actor?.name || null,
          },
          type: CONST.CHAT_MESSAGE_TYPES.OTHER,
          content: await renderTemplate('systems/knight/templates/dices/wpn.html', pAttack),
          sound: CONFIG.sounds.dice
        };

        const rMode = game.settings.get("core", "rollMode");
        const msgData = ChatMessage.applyRollMode(attackMsgData, rMode);

        await ChatMessage.create(msgData, {
          rollMode:rMode
        });
      } else {

        this._doDgts(label, degats, allEffets, false);
        this._doViolence(label, violence, allEffets);
      }
    });

    html.find('.capacites div.bCapacite .activation').click(async ev => {
      const type = $(ev.currentTarget).data("type");
      const capacite = $(ev.currentTarget).data("capacite");
      const name = $(ev.currentTarget)?.data("name") || '';
      const tenebricide = $(ev.currentTarget)?.data("tenebricide") || false;
      const obliteration = $(ev.currentTarget)?.data("obliteration") || false;

      const data = this.actor.items.get(capacite);

      if(type === 'degats') {
        const dataDegats = data.system;

        const allEffets = await this._getAllEffets(dataDegats.degats.system, tenebricide, obliteration)
        this._doDgts(name, dataDegats.degats.system, allEffets, tenebricide);
      }
    });

    html.find('.capacites div.modules .activation').click(async ev => {
      const target = $(ev.currentTarget);
      const type = target.data("type");
      const module = target.data("module");
      const value = target.data("value") ? false : true;
      const cout = eval(target.data("cout"));
      const depense = this._depensePE(cout, true);

      if(!depense) return;

      if(type === 'module') {
        const dataModule = this.actor.items.get(module),
              data = dataModule.system,
              niveau = data.niveau.value,
              dataNiveau = data.niveau.details[`n${niveau}`];

        dataModule.update({[`system.active.base`]:value});

        if(dataNiveau.jetsimple.has && value) {
          const jSREffects = await getEffets(this.actor, 'contact', 'standard', {}, dataNiveau.jetsimple.effets, {raw:[], custom:[]}, {raw:[], custom:[]}, {raw:[], custom:[]}, false);
          const execJSR = new game.knight.RollKnight(dataNiveau.jetsimple.jet, this.actor.system);
          await execJSR.evaluate();

          let jSRoll = {
            flavor:dataNiveau.jetsimple.label,
            main:{
              total:execJSR._total,
              tooltip:await execJSR.getTooltip(),
              formula: execJSR._formula
            },
            other:jSREffects.other
          };

          const jSRMsgData = {
            user: game.user.id,
            speaker: {
              actor: this.actor?.id || null,
              token: this.actor?.token?.id || null,
              alias: this.actor?.name || null,
            },
            type: CONST.CHAT_MESSAGE_TYPES.OTHER,
            rolls:[execJSR].concat(jSREffects.rollDgts),
            content: await renderTemplate('systems/knight/templates/dices/wpn.html', jSRoll),
            sound: CONFIG.sounds.dice
          };

          const rMode = game.settings.get("core", "rollMode");
          const msgFData = ChatMessage.applyRollMode(jSRMsgData, rMode);

          await ChatMessage.create(msgFData, {
            rollMode:rMode
          });
        }
      }

      if(type === 'modulePnj') {
        const index = target.data("index");

        const dataModule = this.actor.items.get(module),
              data = dataModule.system,
              niveau = data.niveau.value,
              dataNiveau = data.niveau.details[`n${niveau}`],
              dataPnj = dataNiveau.pnj.liste[index];

        if(value) {
          const listeAspects = dataPnj.aspects.liste;

          const system = {
            aspects:dataPnj.aspects.has ? {
              'chair':{
                'value':listeAspects.chair.value,
                'ae':{
                  'mineur':{
                    'value':listeAspects.chair.ae.mineur
                  },
                  'majeur':{
                    'value':listeAspects.chair.ae.majeur
                  }
                }
              },
              'bete':{
                'value':listeAspects.bete.value,
                'ae':{
                  'mineur':{
                    'value':listeAspects.bete.ae.mineur
                  },
                  'majeur':{
                    'value':listeAspects.bete.ae.majeur
                  }
                }
              },
              'machine':{
                'value':listeAspects.machine.value,
                'ae':{
                  'mineur':{
                    'value':listeAspects.machine.ae.mineur
                  },
                  'majeur':{
                    'value':listeAspects.machine.ae.majeur
                  }
                }
              },
              'dame':{
                'value':listeAspects.dame.value,
                'ae':{
                  'mineur':{
                    'value':listeAspects.dame.ae.mineur
                  },
                  'majeur':{
                    'value':listeAspects.dame.ae.majeur
                  }
                }
              },
              'masque':{
                'value':listeAspects.masque.value,
                'ae':{
                  'mineur':{
                    'value':listeAspects.masque.ae.mineur
                  },
                  'majeur':{
                    'value':listeAspects.masque.ae.majeur
                  }
                }
              }
            } : {},
            initiative:{
              diceBase:dataPnj.initiative.dice,
              bonus:{user:dataPnj.initiative.fixe}
            },
            armure:{
              base:dataPnj.armure,
              value:dataPnj.armure
            },
            champDeForce:{
              base:dataPnj.champDeForce
            },
            reaction:{
              base:dataPnj.reaction
            },
            defense:{
              base:dataPnj.defense
            },
            options:{
              noAspects:dataPnj.aspects.has ? false : true,
              noArmesImprovisees:dataPnj.aspects.has ? false : true,
              noCapacites:true,
              noGrenades:true,
              noNods:true,
              espoir:false,
              bouclier:false,
              sante:false,
              energie:false,
              resilience:false
            }
          };

          if(dataPnj.jetSpecial.has) {
            const jetsSpeciaux = [];

            system.options.jetsSpeciaux = true;

            for (let [key, jet] of Object.entries(dataPnj.jetSpecial.liste)) {
              jetsSpeciaux.push({
                name:jet.nom,
                value:`${jet.dice}D6+${jet.overdrive}`
              });
            }

            system.jetsSpeciaux = jetsSpeciaux;
          }

          if(dataPnj.type === 'bande') {
            system.debordement = {};
            system.debordement.value = dataPnj.debordement;
          }

          let newActor = await Actor.create({
            name: `${this.title} : ${dataPnj.nom}`,
            type: dataPnj.type,
            img:dataModule.img,
            system:system,
            permission:this.actor.ownership
          });

          if(dataPnj.armes.has && dataPnj.type !== 'bande') {
            const items = [];

            for (let [key, arme] of Object.entries(dataPnj.armes.liste)) {
              const wpnType = arme.type === 'tourelle' ? 'distance' : arme.type;

              let wpn = {
                type:wpnType,
                portee:arme.portee,
                degats:{
                  dice:arme.degats.dice,
                  fixe:arme.degats.fixe
                },
                violence:{
                  dice:arme.violence.dice,
                  fixe:arme.violence.fixe
                },
                effets:{
                  raw:arme.effets.raw,
                  custom:arme.effets.custom
                }
              };

              if(arme.type === 'tourelle') {
                wpn['tourelle'] = {
                  has:true,
                  attaque:{
                    dice:arme.attaque.dice,
                    fixe:arme.attaque.fixe
                  }
                }
              }

              const nItem = {
                name:arme.nom,
                type:'arme',
                system:wpn,
                };

                items.push(nItem);
            }

            await newActor.createEmbeddedDocuments("Item", items);
          }

          this.actor.items.get(module).update({[`system`]:{
            'active':{
              'pnj':true,
              'pnjName':dataPnj.nom
            },
            'id':newActor.id
          }});

        } else if(!value) {
          const actor = game.actors.get(dataModule.system.id);

          await actor.delete();

          dataModule.update({[`system`]:{
            'active':{
              'pnj':false,
              'pnjName':''
            },
            'id':''
          }});
        }
      }

      if(type === 'module') {
        this.actor.items.get(module).update({[`system.active.base`]:value})
      }

      if(type === 'modulePnj') {
        this.actor.items.get(module).update({[`system.active.pnj`]:value})
      }
    });

    html.find('.capacites div.modules .desactivation').click(async ev => {
      const type = $(ev.currentTarget).data("type");
      const module = $(ev.currentTarget).data("module");

      if(type === 'module') {
        this.actor.items.get(module).update({[`system.active.base`]:false})
      }

      if(type === 'modulePnj') {
        this.actor.items.get(module).update({[`system.active.pnj`]:false})
      }
    });

    html.find('.capacites div.modules .supplementaire').click(async ev => {
      const cout = eval($(ev.currentTarget).data("cout"));

      this._depensePE(cout, true);
    });

    html.find('div.nods img.dice').click(async ev => {
      const data = this.getData();
      const target = $(ev.currentTarget);
      const nbre = +target.data("number");
      const nods = target.data("nods");

      if(nbre > 0) {
        const recuperation = data.data.system.combat.nods[nods].recuperationBonus;
        const bonus = recuperation.length > 0 ? recuperation.join(' + ') : ` 0`;

        const rNods = new game.knight.RollKnight(`3D6+${bonus}`, this.actor.system);
        rNods._flavor = game.i18n.localize(`KNIGHT.JETS.Nods${nods}`);
        rNods._success = false;
        await rNods.toMessage({
          speaker: {
          actor: this.actor?.id || null,
          token: this.actor?.token?.id || null,
          alias: this.actor?.name || null,
          }
        });

        let base = 0;
        let max = 0;
        let type = '';

        switch(nods) {
          case 'soin':
            type = 'sante';
            base = data.data.system.sante.value;
            max = data.data.system.sante.max;

            break;

          case 'energie':
            type = 'energie';
            base = data.data.system.energie.value;
            max = data.data.system.energie.max;
            break;

          case 'armure':
            type = 'armure'
            base = data.data.system.armure.value;
            max = data.data.system.armure.max;
            break;
        }

        const total = rNods.total;
        const final = base+total > max ? max : base+total;

        const update = {
          'system':{
            'combat':{
              'nods':{
                [nods]:{
                  'value':nbre - 1
                }
              }
            },
            [type]:{
              'value':final
            }
          }
        };

        this.actor.update(update);
      }
    });

    html.find('div.nods img.diceTarget').click(async ev => {
      const data = this.getData();
      const target = $(ev.currentTarget);
      const nbre = +target.data("number");
      const nods = target.data("nods");

      if(nbre > 0) {
        const recuperation = data.data.system.combat.nods[nods].recuperationBonus;
        const bonus = recuperation.length > 0 ? recuperation.join(' + ') : ` 0`;

        const rNods = new game.knight.RollKnight(`3D6+${bonus}`, this.actor.system);
        rNods._flavor = game.i18n.localize(`KNIGHT.JETS.Nods${nods}`);
        rNods._success = false;
        await rNods.toMessage({
          speaker: {
          actor: this.actor?.id || null,
          token: this.actor?.token?.id || null,
          alias: this.actor?.name || null,
          }
        });

        const update = {
          'system':{
            'combat':{
              'nods':{
                [nods]:{
                  'value':nbre - 1
                }
              }
            }
          }
        };

        this.actor.update(update);
      }
    });

    html.find('img.rollSpecifique').click(async ev => {
      const target = $(ev.currentTarget);
      const name = target.data("name");
      const roll = target.data("roll");

      const rSpec = new game.knight.RollKnight(`${roll}`, this.actor.system);
      rSpec._flavor = name;
      rSpec._success = true;

      await rSpec.toMessage({
        speaker: {
        actor: this.actor?.id || null,
        token: this.actor?.token?.id || null,
        alias: this.actor?.name || null,
        }
      });
    });

    html.find('.roll').click(ev => {
      const target = $(ev.currentTarget);
      const label = target.data("label") || '';
      const aspect = target.data("aspect") || '';
      const reussites = +target.data("reussitebonus") || 0;

      dialogRoll(label, this.actor, {base:aspect, succesBonus:reussites});
    });

    html.find('.rollRecuperationArt').click(async ev => {
      const target = $(ev.currentTarget);
      const value = target.data("value");

      const rEspoir = new game.knight.RollKnight(`${value}`, this.actor.system);
      rEspoir._flavor = game.i18n.localize("KNIGHT.ART.RecuperationEspoir");
      rEspoir._success = false;
      await rEspoir.toMessage({
        speaker: {
        actor: this.actor?.id || null,
        token: this.actor?.token?.id || null,
        alias: this.actor?.name || null,
        }
      });
    });

    html.find('.art-say').click(async ev => {
      const target = $(ev.currentTarget);
      const type = target.data("type");
      const name = game.i18n.localize(`KNIGHT.ART.PRATIQUE.${type.charAt(0).toUpperCase()+type.substr(1)}`);
      const data = this.getData().actor.art.system.pratique[type];

      const msg = {
        user: game.user.id,
        speaker: {
          actor: this.actor?.id || null,
          token: this.actor?.token?.id || null,
          alias: this.actor?.name || null,
        },
        type: CONST.CHAT_MESSAGE_TYPES.OTHER,
        content: `<span style="display:flex;width:100%;font-weight:bold;">${name}</span><span style="display:flex;width:100%;text-align:justify;justify-content:left;word-break:break-all;">${data}</span>`
      };

      const rMode = game.settings.get("core", "rollMode");
      const msgData = ChatMessage.applyRollMode(msg, rMode);

      await ChatMessage.create(msgData, {
        rollMode:rMode
      });
    });

    html.find('.jetWpn').click(ev => {
      const target = $(ev.currentTarget);
      const name = target.data("name");
      const id = target.data("id");
      const isDistance = target.data("isdistance");
      const num = target.data("num");
      const aspect = target?.data("aspect") || [];

      let label;

      switch(isDistance) {
        case 'grenades':
          const dataGrenade = this.actor.system.combat.grenades.liste[name];
          label = dataGrenade.custom ? `${game.i18n.localize(`KNIGHT.COMBAT.GRENADES.Singulier`)} ${dataGrenade.label}` : `${game.i18n.localize(`KNIGHT.COMBAT.GRENADES.Singulier`)} ${game.i18n.localize(`KNIGHT.COMBAT.GRENADES.${name.charAt(0).toUpperCase()+name.substr(1)}`)}`;
          break;

        case 'armesimprovisees':
          label = game.i18n.localize(CONFIG.KNIGHT.armesimprovisees[name][num]);
          break;

        default:
          label = name;
          break;
      }

      dialogRoll(label, this.actor, {base:aspect, isWpn:true, idWpn:id, nameWpn:name, typeWpn:isDistance, num:num});
    });

    html.find('.setResilience').click(async ev => {
      const askContent = await renderTemplate("systems/knight/templates/dialog/ask-sheet.html", {
        what:`${game.i18n.localize("KNIGHT.RESILIENCE.TYPES.Label")} ?`,
        select:{
          has:true,
          liste:{
            colosseRecrue:game.i18n.localize("KNIGHT.RESILIENCE.TYPES.COLOSSE.Recrue"),
            colosseInitie:game.i18n.localize("KNIGHT.RESILIENCE.TYPES.COLOSSE.Initie"),
            colosseHeros:game.i18n.localize("KNIGHT.RESILIENCE.TYPES.COLOSSE.Heros"),
            patronRecrue:game.i18n.localize("KNIGHT.RESILIENCE.TYPES.PATRON.Recrue"),
            patronInitie:game.i18n.localize("KNIGHT.RESILIENCE.TYPES.PATRON.Initie"),
            patronHeros:game.i18n.localize("KNIGHT.RESILIENCE.TYPES.PATRON.Heros"),
          }
        }
      });
      const askDialogOptions = {classes: ["dialog", "knight", "askdialog"]};

      await new Dialog({
        title: game.i18n.localize('KNIGHT.RESILIENCE.CalculResilience'),
        content: askContent,
        buttons: {
          button1: {
            label: game.i18n.localize('KNIGHT.RESILIENCE.Calcul'),
            callback: async (data) => {
              const getData = this.getData().data.system;
              const dataSante = +getData.sante.max;
              const dataArmure = +getData.armure.max;
              const hasSante = getData.options.sante;
              const hasArmure = getData.options.armure;

              const selected = data.find('.whatSelect').val();

              const update = {
                system:{
                  resilience:{
                    max:0,
                    value:0
                  }
                }
              };

              let calcul = 0;

              switch(selected) {
                case 'colosseRecrue':
                  if(hasSante) calcul = Math.floor(dataSante/10);
                  else if(hasArmure) calcul = Math.floor(dataArmure/10);
                  break

                case 'colosseInitie':
                  if(hasSante) calcul = Math.floor(dataSante/10)*2;
                  else if(hasArmure) calcul = Math.floor(dataArmure/10)*2;
                  break

                case 'colosseHeros':
                  if(hasSante) calcul = Math.floor(dataSante/10)*3;
                  else if(hasArmure) calcul = Math.floor(dataArmure/10)*3;
                  break

                case 'patronRecrue':
                  if(hasSante) calcul = Math.floor(dataSante/30);
                  else if(hasArmure) calcul = Math.floor(dataArmure/30);
                  break

                case 'patronInitie':
                  if(hasSante) calcul = Math.floor(dataSante/20);
                  else if(hasArmure) calcul = Math.floor(dataArmure/20);
                  break

                case 'patronHeros':
                  if(hasSante) calcul = Math.floor(dataSante/10);
                  else if(hasArmure) calcul = Math.floor(dataArmure/10);
                  break
              }

              update.system.resilience.max = calcul;
              update.system.resilience.value = calcul;

              this.actor.update(update);

            },
            icon: `<i class="fas fa-check"></i>`
          }
        }
      }, askDialogOptions).render(true);
    });

    html.find('div.options button').click(ev => {
      const target = $(ev.currentTarget);
      const value = target.data("value");
      const option = target.data("option");
      const result = value === true ? false : true;

      this.actor.update({[`system.options.${option}`]:result});
    });

    html.find('.armure .supplementaire').click(async ev => {
      const cout = eval($(ev.currentTarget).data("cout"));

      this._depensePE(cout, true);
    });

    html.find('.capacites div.wolf .activationConfiguration').click(ev => {
      const configuration = eval($(ev.currentTarget).data("configuration"));
      const data = this.getData().data.system;
      const configurationData = data.wolf[configuration]

      this.actor.update({[`system`]:{
        'configurationActive':configuration
      }});

      this._depensePE(configurationData.energie);
    });

    html.find('div.armure div.wolf img.info').click(ev => {
      const span = $(ev.currentTarget).siblings("span.hideInfo")
      const width = $(ev.currentTarget).parents("div.mainData").width() / 2;
      const isW50 = $(ev.currentTarget).parents("div.data").width();
      let position = "";
      let borderRadius = "border-top-right-radius";

      if(isW50 <= width) {
        if($(ev.currentTarget).parents("div.data").position().left > width) {
          position = "right";
          borderRadius = "border-top-right-radius";
        } else {
          position = "left";
          borderRadius = "border-top-left-radius";
        }
      } else {
        if($(ev.currentTarget).parent().position().left > width) {
          position = "right";
          borderRadius = "border-top-right-radius";
        } else {
          position = "left";
          borderRadius = "border-top-left-radius";
        }
      }

      span.width($(html).width()/2).css(position, "0px").css(borderRadius, "0px").toggle("display");
      $(ev.currentTarget).toggleClass("clicked");
    });

    html.find('div.capacites div.modules img.info').click(ev => {
      const span = $(ev.currentTarget).siblings("span.hideInfo")
      const width = $(ev.currentTarget).parents("div.mainBlock").width() / 2;
      const isW50 = $(ev.currentTarget).parents("div.data").width();
      let position = "";
      let borderRadius = "border-top-right-radius";

      if(isW50 <= width) {
        if($(ev.currentTarget).parents("div.data").position().left > width) {
          position = "right";
          borderRadius = "border-top-right-radius";
        } else {
          position = "left";
          borderRadius = "border-top-left-radius";
        }
      } else {
        if($(ev.currentTarget).parent().position().left > width) {
          position = "right";
          borderRadius = "border-top-right-radius";
        } else {
          position = "left";
          borderRadius = "border-top-left-radius";
        }
      }

      span.width($(html).width()/2).css(position, "0px").css(borderRadius, "0px").toggle("display");
      $(ev.currentTarget).toggleClass("clicked");
    });

    html.find('.activatePhase2').click(ev => {
      const data = this.getData().data.system;
      const options = data.options;
      const phase2 = data.phase2;

      const effects = [];

      if(options.sante) {
        effects.push({
          key: path.sante.bonus,
          mode: 2,
          priority: null,
          value: phase2.sante
        });
      }

      if(options.armure) {
        effects.push({
          key: path.armure.bonus,
          mode: 2,
          priority: null,
          value: phase2.armure
        });
      }

      if(options.energie) {
        effects.push({
          key: path.energie.bonus,
          mode: 2,
          priority: null,
          value: phase2.energie
        });
      }

      const listAspects = ['chair', 'bete', 'machine', 'dame', 'masque'];

      for(let i = 0;i < listAspects.length;i++) {
        const label = listAspects[i];

        effects.push({
          key: `system.aspects.${label}.value`,
          mode: 5,
          priority: null,
          value: Number(data.aspects[label].value)+Number(phase2.aspects[label].value)
        },
        {
          key: `system.aspects.${label}.ae.mineur.value`,
          mode: 5,
          priority: null,
          value: Number(data.aspects[label].ae.mineur.value)+Number(phase2.aspects[label].ae.mineur)
        },
        {
          key: `system.aspects.${label}.ae.majeur.value`,
          mode: 5,
          priority: null,
          value: Number(data.aspects[label].ae.majeur.value)+Number(phase2.aspects[label].ae.majeur)
        });
      }

      addOrUpdateEffect(this.actor, 'phase2', effects);
      this.actor.update({['system.phase2Activate']:true});
    });

    html.find('.desactivatePhase2').click(ev => {
      const listEffect = this.actor.getEmbeddedCollection('ActiveEffect');
      const effectExist = existEffect(listEffect, 'phase2');
      const toUpdate = [];

      toUpdate.push({
        "_id":effectExist._id,
        disabled:true
      });

      updateEffect(this.actor, toUpdate);
      this.actor.update({['system.phase2Activate']:false});
    });

    html.find('i.moduleArrowUp').click(ev => {
      const target = $(ev.currentTarget);
      const key = target.data("key");
      const niveau = Number(target.data("niveau"))+1;
      const item = this.actor.items.get(key);

      const data = {
        "niveau":{
          "value":niveau
        }
      }

      item.update({[`system`]:data});
    });

    html.find('i.moduleArrowDown').click(ev => {
      const target = $(ev.currentTarget);
      const key = target.data("key");
      const niveau = Number(target.data("niveau"))-1;
      const item = this.actor.items.get(key);

      const data = {
        "niveau":{
          "value":niveau
        }
      }

      item.update({[`system`]:data});
    });

    html.find('button.recover').click(ev => {
      const target = $(ev.currentTarget);
      const type = target.data("type");
      const max = target.data("max");
      const list = target?.data("list")?.split("/") || '';

      switch(type) {
        case 'espoir':
        case 'sante':
        case 'armure':
        case 'energie':
        case 'grenades':
          html.find(`div.${type} input.value`).val(max);
          break;

        case 'nods':
          let update = {};

          for (let i of list) {
            const split = i.split('-');
            const name = split[0];
            const max = split[1];

            html.find(`div.${type} input.${name}Value`).val(max);
          }
          break;
      }
    });

    html.find('a.add').click(ev => {
      const target = $(ev.currentTarget);
      const type = target.data("type");

      let update = {};

      switch(type) {
        case 'grenade':
          const getGrenades = this.actor.system.combat.grenades.liste;
          const getLength = Object.keys(getGrenades).length;

          update[`system.combat.grenades.liste`] = {
            [`grenade_${getLength}`]: {
              "custom":true,
              "label":"",
              "degats": {
                "dice": getGrenades.antiblindage.degats.dice
              },
              "violence": {
                "dice": getGrenades.antiblindage.violence.dice
              },
              "effets":{
                "liste":[],
                "raw":[],
                "custom":[]
              }
            }
          }
          break;
      }

      this.actor.update(update);
    });

    html.find('a.delete').click(ev => {
      const target = $(ev.currentTarget);
      const type = target.data("type");
      const id = target.data("id");

      let update = {};

      switch(type) {
        case 'grenade':
          update[`system.combat.grenades.liste.-=${id}`] = null;
          break;
      }

      this.actor.update(update);
    });

    html.find('div.effets a.edit').click(async ev => {
      const data = this.getData();
      const maxEffets = data.systemData.type === 'contact' ? data?.systemData?.restrictions?.contact?.maxEffetsContact || undefined : undefined;
      const stringPath = $(ev.currentTarget).data("path");
      const aspects = CONFIG.KNIGHT.listCaracteristiques;
      let path = data.data;

      stringPath.split(".").forEach(function(key){
        path = path[key];
      });

      await new game.knight.applications.KnightEffetsDialog({actor:this.actor._id, item:null, isToken:this?.document?.isToken || false, token:this?.token || null, raw:path.raw, custom:path.custom, toUpdate:stringPath, aspects:aspects, maxEffets:maxEffets, title:`${this.object.name} : ${game.i18n.localize("KNIGHT.EFFETS.Edit")}`}).render(true);
    });
  }

  /* -------------------------------------------- */
  async _onItemCreate(event) {
    event.preventDefault();
    const header = event.currentTarget;
    // Get the type of item to create.
    const type = header.dataset.type;
    // Grab any data associated with this control.
    const data = duplicate(header.dataset);
    // Initialize a default name.
    const name = `${game.i18n.localize(`TYPES.Item.${type}`)}`;
    // Prepare the item object.
    const itemData = {
      name: name,
      type: type,
      img:getDefaultImg(type),
      system: data
    };

    // Remove the type from the dataset since it's in the itemData.type prop.
    delete itemData.system["type"];

    if (type === 'arme') {
      itemData.system = {
        type:header.dataset.subtype,
        tourelle:{
          has:header.dataset.tourelle
        }
      };
      delete itemData.system["subtype"];
    }

    const create = await Item.create(itemData, {parent: this.actor});

    // Finally, create the item!
    return create;
  }

  async _onDropItemCreate(itemData) {
    const actorData = this.getData().data.system;

    itemData = itemData instanceof Array ? itemData : [itemData];
    const itemBaseType = itemData[0].type;
    const options = actorData.options;

    const typesValides = [
      'avantage', 'inconvenient',
      'motivationMineure', 'contact',
      'blessure', 'trauma',
      'armurelegende', 'effet', 'distinction',
      'capaciteultime'];
    if (typesValides.includes(itemBaseType)) return;
    if (itemBaseType === 'module' && !options.modules) return;

    const itemCreate = await this.actor.createEmbeddedDocuments("Item", itemData);
    const itemId = itemCreate[0]._id;
    const oldArtId = actorData?.art || 0;

    if (itemBaseType === 'art') {
      const update = {
        system:{
          art:itemId
        }
      };

      if(oldArtId !== 0) {
        const oldArt = this.actor.items?.get(oldArtId) || false;
        if(oldArt !== false) oldArt.delete();
      }

      this.actor.update(update);
    }

    if (itemBaseType === 'armure') {
      const update = {};
      const oldArmorId = actorData?.equipements?.armure?.id || 0;

      if (oldArmorId !== 0) {
        const oldArmor = this.actor.items.get(oldArmorId);

        oldArmor.delete();
      }

      update['system.equipements.armure'] = {
        id:itemId, hasArmor:true,
        capacites:{
          ascension:{
            id:0,
            energie:0
          },
          borealis:{
            allie:0
          },
          changeling:{
            fauxetres:0
          },
          companions:{
            type:"",
            energie:0,
            energieDisponible:[]
          },
          forward:1,
          goliath:{
            metre:0
          },
          morph:{
            nbre:0
          },
          puppet:{
            cible:0
          },
          rage:{
            niveau:{}
          },
          totem:{
            nombre:0
          },
          warlord:{
            energie:{
              nbre:1
            },
            force:{
              nbre:1
            },
            esquive:{
              nbre:1
            },
            guerre:{
              nbre:1
            }
          },
          vision:{
            energie:0
          }
        }
      };
      this.actor.update(update);
    }

    return itemCreate;
  }

  async _prepareCharacterItems(sheetData) {
    const actorData = sheetData.actor;
    const system = sheetData.data.system;

    const armesContact = [];
    const armesDistance = [];
    const armesTourelles = [];
    const langue = [];
    const modules = [];
    const capacites = [];
    const moduleBonusDgts = {
      "contact":[],
      "distance":[]
    };
    const moduleBonusDgtsVariable = {
      "contact":[],
      "distance":[]
    };
    const moduleBonusViolence = {
      "contact":[],
      "distance":[]
    };
    const moduleBonusViolenceVariable = {
      "contact":[],
      "distance":[]
    };
    const aspects = {
      "chair":system.aspects.chair.value,
      "bete":system.aspects.bete.value,
      "machine":system.aspects.machine.value,
      "dame":system.aspects.dame.value,
      "masque":system.aspects.masque.value,
    };
    const aspectLieSupp = [];
    const labels = Object.assign({},
      CONFIG.KNIGHT.effets,
      CONFIG.KNIGHT.AMELIORATIONS.distance,
      CONFIG.KNIGHT.AMELIORATIONS.structurelles,
      CONFIG.KNIGHT.AMELIORATIONS.ornementales
    );

    let art = {};
    let armureData = {};
    let longbow = {};
    const effects = {armure:[], modules:[], capacites:[], phase2:[], armes:[]};
    const aspectsMax = {
      chair:{max:[20], ae:{mineur:[10], majeur:[10]}},
      bete:{max:[20], ae:{mineur:[10], majeur:[10]}},
      machine:{max:[20], ae:{mineur:[10], majeur:[10]}},
      dame:{max:[20], ae:{mineur:[10], majeur:[10]}},
      masque:{max:[20], ae:{mineur:[10], majeur:[10]}},
    };

    for (let i of sheetData.items) {
      const data = i.system;

      // ARMURE.
      if (i.type === 'armure') {
        armureData = i;

        const capaLongbow = data.capacites.selected?.longbow ?? false;

        if(capaLongbow !== false) {
          longbow = capaLongbow;
          longbow['has'] = true;
          longbow.energie = 0;

          longbow.degats.cout = 0;
          longbow.degats.dice = capaLongbow.degats.min;

          longbow.violence.cout = 0;
          longbow.violence.dice = capaLongbow.violence.min;

          const rangeListe = ['contact', 'courte', 'moyenne', 'longue', 'lointaine'];
          let rangeToNumber = {};
          let peRange = longbow.portee.energie;
          let minRange = longbow.portee.min;
          let maxRange = longbow.portee.max;
          let isInRange = false;
          let multiplicateur = 0;

          for(let n = 0; n < rangeListe.length;n++) {
            if(rangeListe[n] === minRange) {
              isInRange = true;
              rangeToNumber[rangeListe[n]] = multiplicateur*peRange;
              multiplicateur += 1;
            } else if(rangeListe[n] === maxRange) {
              isInRange = false;
              rangeToNumber[rangeListe[n]] = multiplicateur*peRange;
            } else if(isInRange) {
              rangeToNumber[rangeListe[n]] = multiplicateur*peRange;
              multiplicateur += 1;
            }
          }

          longbow.portee.cout = 0;
          longbow.portee.value = capaLongbow.portee.min;
          longbow.portee.rangeToNumber = rangeToNumber;

          longbow.effets.raw = [];
          longbow.effets.custom = [];
          longbow.effets.liste = [];
          longbow.effets.liste1.cout = 0;
          longbow.effets.liste1.selected = 0;
          longbow.effets.liste2.cout = 0;
          longbow.effets.liste2.selected = 0;
          longbow.effets.liste3.cout = 0;
          longbow.effets.liste3.selected = 0;
        }
      }

      // ARME
      if (i.type === 'arme') {
        const type = data.type;
        const tourelle = data.tourelle;

        data.noRack = true;
        data.pnj = true;

        const optionsMunitions = data?.optionsmunitions?.has || false;
        const options2mains = data?.options2mains?.has || false;

        const main = data.options2mains.actuel;
        const munition = data.optionsmunitions.actuel;

        if(type === 'contact' && options2mains === true) {
          data.degats.dice = data?.options2mains?.[main]?.degats?.dice || 0;
          data.degats.fixe = data?.options2mains?.[main]?.degats?.fixe || 0;

          data.violence.dice = data?.options2mains?.[main]?.violence?.dice || 0;
          data.violence.fixe = data?.options2mains?.[main]?.violence?.fixe || 0;
        }

        if(type === 'distance' && optionsMunitions === true) {
          data.degats.dice = data.optionsmunitions?.liste?.[munition]?.degats?.dice || 0;
          data.degats.fixe = data.optionsmunitions?.liste?.[munition]?.degats?.fixe || 0

          data.violence.dice = data.optionsmunitions?.liste?.[munition]?.violence?.dice || 0;
          data.violence.fixe = data.optionsmunitions?.liste?.[munition]?.violence?.fixe || 0;
        }

        const bonusEffects = getFlatEffectBonus(i);

        effects.armes.push({
          key: path.defense.bonus,
          mode: 2,
          priority: 3,
          value: bonusEffects.defense.bonus
        });

        effects.armes.push({
          key: path.defense.malus,
          mode: 2,
          priority: 3,
          value: bonusEffects.defense.malus
        });

        effects.armes.push({
          key: path.reaction.bonus,
          mode: 2,
          priority: 3,
          value: bonusEffects.reaction.bonus
        });

        effects.armes.push({
          key: path.reaction.malus,
          mode: 2,
          priority: 3,
          value: bonusEffects.reaction.malus
        });

        effects.armes.push({
          key: path.champDeForce.bonus,
          mode: 2,
          priority: 3,
          value: bonusEffects.cdf.bonus
        });

        if(tourelle.has && type === 'distance') {
          armesTourelles.push(i);
        } else {
          if (type === 'contact') { armesContact.push(i); }
          else if (type === 'distance') { armesDistance.push(i); }
        }
      }

      // LANGUE
      if (i.type === 'langue') {
        langue.push(i);
      }

      // MODULES
      if (i.type === 'module') {
        const niveau = data.niveau.value;
        const itemDataNiveau = data.niveau.details[`n${niveau}`];
        const itemBonus = itemDataNiveau?.bonus || {has:false};
        const itemArme = itemDataNiveau?.arme || {has:false};
        const itemEffets = itemDataNiveau?.effets || {has:false};
        const itemActive = data?.active?.base || false;
        const dataMunitions = itemArme?.optionsmunitions || {has:false};

        if(dataMunitions.has) {
          for (const [key, value] of Object.entries(dataMunitions.liste)) {
            itemArme.optionsmunitions.liste[key].liste = listEffects(value.raw, value.custom, labels);
          }
        }

        if(itemDataNiveau.permanent || itemActive) {
          let bonusDef = 0;
          let bonusRea = 0;

          if(itemEffets.has) {
            const bDefense = itemEffets.raw.find(str => { if(str.includes('defense')) return str; });
            const bReaction = itemEffets.raw.find(str => { if(str.includes('reaction')) return str; });

            if(bDefense !== undefined) bonusDef += +bDefense.split(' ')[1];
            if(bReaction !== undefined) bonusRea += +bReaction.split(' ')[1];
          }

          if(itemBonus.has) {
            const iBSante = itemBonus.sante;
            const iBArmure = itemBonus.armure;
            const iBCDF = itemBonus.champDeForce;
            const iBEnergie = itemBonus.energie;
            const iBDgts = itemBonus.degats;
            const iBDgtsVariable = iBDgts.variable;
            const iBViolence = itemBonus.violence;
            const iBViolenceVariable = iBViolence.variable;

            if(iBSante?.has || false) effects.modules.push({
              key:path.sante.bonus,
              mode:2,
              priority:null,
              value:iBSante.value
            });

            if(iBArmure.has) { effects.modules.push({
                key: path.armure.bonus,
                mode: 2,
                priority: null,
                value: iBArmure.value
              });
            }
            if(iBCDF.has) { effects.modules.push({
                key: path.champDeForce.bonus,
                mode: 2,
                priority: null,
                value: iBCDF.value
              });
            }
            if(iBEnergie.has) { effects.modules.push({
                key: path.energie.bonus,
                mode: 2,
                priority: null,
                value: iBEnergie.value
              });
            }
            if(iBDgts.has) {
              if(iBDgtsVariable.has) {
                moduleBonusDgtsVariable[iBDgts.type].push({
                  label:i.name,
                  description:data.description,
                  selected:{
                    dice:0,
                    fixe:0
                  },
                  min:{
                    dice:iBDgtsVariable.min.dice,
                    fixe:iBDgtsVariable.min.fixe
                  },
                  max:{
                    dice:iBDgtsVariable.max.dice,
                    fixe:iBDgtsVariable.max.fixe
                  }
                });
              } else {
                moduleBonusDgts[iBDgts.type].push({
                  label:i.name,
                  description:data.description,
                  dice:iBDgts.dice,
                  fixe:iBDgts.fixe
                });
              }
            }
            if(iBViolence.has) {
              if(iBViolenceVariable.has) {
                moduleBonusViolenceVariable[iBViolence.type].push({
                  label:i.name,
                  description:i.system.description,
                  selected:{
                    dice:0,
                    fixe:0
                  },
                  min:{
                    dice:iBViolenceVariable.min.dice,
                    fixe:iBViolenceVariable.min.fixe
                  },
                  max:{
                    dice:iBViolenceVariable.max.dice,
                    fixe:iBViolenceVariable.max.fixe
                  }
                });
              } else {
                moduleBonusViolence[iBViolence.type].push({
                  label:i.name,
                  description:i.system.description,
                  dice:iBViolence.dice,
                  fixe:iBViolence.fixe
                });
              }
            }
          }

          if(itemArme.has) {
            const moduleEffets = itemArme.effets;

            let degats = itemArme.degats;
            let violence = itemArme.violence;

            if(dataMunitions.has) {
              let actuel = dataMunitions.actuel;

              if(actuel === undefined) {
                dataMunitions.actuel = "0";
                actuel = "1";
              }

              degats = dataMunitions.liste[actuel].degats;
              violence = dataMunitions.liste[actuel].violence;
            }

            const moduleWpn = {
              _id:i._id,
              name:i.name,
              type:'module',
              system:{
                noRack:true,
                type:itemArme.type,
                portee:itemArme.portee,
                degats:degats,
                violence:violence,
                optionsmunitions:dataMunitions,
                effets:{
                  raw:moduleEffets.raw,
                  custom:moduleEffets.custom
                },
                niveau:niveau,
              }
            }

            if(itemArme.type === 'contact') { armesContact.push(moduleWpn); }

            if(itemArme.type === 'distance') {
              armesDistance.push(moduleWpn);
            }

            const bonusEffects = getFlatEffectBonus(moduleWpn, true);

            effects.modules.push({
              key: path.defense.bonus,
              mode: 2,
              priority: 3,
              value: bonusEffects.defense.bonus
            });

            effects.modules.push({
              key: path.defense.malus,
              mode: 2,
              priority: 3,
              value: bonusEffects.defense.malus
            });

            effects.modules.push({
              key: path.reaction.bonus,
              mode: 2,
              priority: 3,
              value: bonusEffects.reaction.bonus
            });

            effects.modules.push({
              key: path.reaction.malus,
              mode: 2,
              priority: 3,
              value: bonusEffects.reaction.malus
            });

            effects.modules.push({
              key: path.champDeForce.bonus,
              mode: 2,
              priority: 3,
              value: bonusEffects.cdf.bonus
            });
          }

          if(bonusDef > 0) {
            effects.modules.push({
              key: path.defense.bonus,
              mode: 2,
              priority: null,
              value: bonusDef
            });
          }

          if(bonusRea > 0) {
            effects.modules.push({
              key: path.reaction.bonus,
              mode: 2,
              priority: null,
              value: bonusRea
            });
          }
        }

        i.system.bonus = itemBonus;
        i.system.arme = itemArme;
        i.system.permanent = itemDataNiveau.permanent;
        i.system.duree = itemDataNiveau.duree;
        i.system.energie = itemDataNiveau.energie;
        i.system.rarete = itemDataNiveau.rarete;
        i.system.activation = itemDataNiveau.activation;
        i.system.portee = itemDataNiveau.portee;
        i.system.labels = itemDataNiveau.labels;
        i.system.pnj = itemDataNiveau.pnj;
        i.system.jetsimple = itemDataNiveau.jetsimple;
        i.system.effets = itemDataNiveau.effets;

        modules.push(i);
      }

      // CAPACITES
      if (i.type === 'capacite') {
        capacites.push(i);

        const isPhase2 = data.isPhase2;
        const bonus = data.bonus;
        const attaque = data.attaque;

        const aLieSupp = bonus.aspectsLieSupplementaire;
        const cSante = bonus.sante;
        const cArmure = bonus.armure;
        const aspectMax = bonus.aspectMax;

        if(!isPhase2) {
          if(aLieSupp.has) aspectLieSupp.push(aLieSupp.value);

          if(cSante.has) {
            if(cSante.aspect.lie) {
              effects.capacites.push({
                key: path.sante.bonus,
                mode: 2,
                priority: null,
                value: aspects[cSante.aspect.value]*cSante.aspect.multiplie
              });
            } else {
              effects.capacites.push({
                key: path.sante.bonus,
                mode: 2,
                priority: null,
                value: cSante.value
              });
            }
          }

          if(cArmure.has) {
            if(cArmure.aspect.lie) {
              effects.capacites.push({
                key: path.armure.bonus,
                mode: 2,
                priority: null,
                value: aspects[cArmure.aspect.value]*cArmure.aspect.multiplie
              });
            } else {
              effects.capacites.push({
                key: path.armure.bonus,
                mode: 2,
                priority: null,
                value: cArmure.value
              });
            }
          }

          if(aspectMax.has) {
            const aMax = aspectMax.aspect;
            aspectsMax[aMax].max.push(aspectMax.maximum.aspect);
            aspectsMax[aMax].ae.mineur.push(aspectMax.maximum.ae);
            aspectsMax[aMax].ae.majeur.push(aspectMax.maximum.ae);
          }

          if(attaque.has) {
            const capaciteWpn = {
              _id:i._id,
              name:i.name,
              type:'capacite',
              system:{
                noRack:true,
                type:attaque.type,
                portee:attaque.portee,
                degats:attaque.degats,
                violence:{
                  dice:0,
                  fixe:0,
                },
                effets:{
                  raw:attaque.effets.raw,
                  custom:attaque.effets.custom,
                }
              }
            }

            if(attaque.type === 'contact') {
              armesContact.push(capaciteWpn);
            } else if(attaque.type === 'distance') {
              armesDistance.push(capaciteWpn);
            }
          }
        } else if(isPhase2 && system.phase2Activate) {
          if(aLieSupp.has) aspectLieSupp.push(aLieSupp.value);

          if(cSante.has) {
            if(cSante.aspect.lie) {
              effects.capacites.push({
                key: path.sante.bonus,
                mode: 2,
                priority: null,
                value: aspects[cSante.aspect.value]*cSante.aspect.multiplie
              });
            } else {
              effects.capacites.push({
                key: path.sante.bonus,
                mode: 2,
                priority: null,
                value: cSante.value
              });
            }
          }

          if(cArmure.has) {
            if(cArmure.aspect.lie) {
              effects.capacites.push({
                key: path.armure.bonus,
                mode: 2,
                priority: null,
                value: aspects[cArmure.aspect.value]*cArmure.aspect.multiplie
              });
            } else {
              effects.capacites.push({
                key: path.armure.bonus,
                mode: 2,
                priority: null,
                value: cArmure.value
              });
            }
          }

          if(aspectMax.has) {
            const aMax = aspectMax.aspect;
            aspectsMax[aMax].max = aspectMax.maximum.aspect;
            aspectsMax[aMax].ae.mineur.max = aspectMax.maximum.ae;
            aspectsMax[aMax].ae.majeur.max = aspectMax.maximum.ae;
          }

          if(attaque.has) {
            const capaciteWpn = {
              _id:i._id,
              name:i.name,
              type:'capacite',
              system:{
                noRack:true,
                type:attaque.type,
                portee:attaque.portee,
                degats:attaque.degats,
                effets:{
                  raw:attaque.effets.raw,
                  custom:attaque.effets.custom,
                }
              }
            }

            if(attaque.type === 'contact') {
              armesContact.push(capaciteWpn);
            } else if(attaque.type === 'distance') {
              armesDistance.push(capaciteWpn);
            }
          }
        }
      }

      // ART
      if (i.type === 'art') {
        art = i;
      }
    }

    for (let i of capacites) {
      const system = i.system;

      if((!i.isPhase2) || (i.isPhase2 && system.phase2Activate)) {

        for(let i = 0; i < aspectLieSupp.length; i++) {
          const bonus = system.bonus;
          const cSante = bonus.sante;
          const cArmure = bonus.armure;
          const aspectMax = bonus.aspectMax;

          if(cSante.has && cSante.aspect.lie && cSante.aspect.value !== aspectLieSupp[i]) {
            effects.capacites.push({
              key: path.sante.bonus,
              mode: 2,
              priority: null,
              value: aspects[aspectLieSupp[i]]*cSante.aspect.multiplie
            });
          }

          if(cArmure.has && cArmure.aspect.lie && cArmure.aspect.value !== aspectLieSupp[i]) {
            effects.capacites.push({
              key: path.armure.bonus,
              mode: 2,
              priority: null,
              value: aspects[aspectLieSupp[i]]*cArmure.aspect.multiplie
            });
          }

          if(aspectMax.has && aspectMax.aspect !== aspectLieSupp[i]) {
            aspectsMax[aspectLieSupp[i]].max.push(aspectMax.maximum.aspect);
            aspectsMax[aspectLieSupp[i]].ae.mineur.push(aspectMax.maximum.ae);
            aspectsMax[aspectLieSupp[i]].ae.majeur.push(aspectMax.maximum.ae);
          }
        }
      }
    }

    for(let i = 0;i < armesContact.length;i++) {
      armesContact[i].system.degats.module = {};
      armesContact[i].system.degats.module.fixe = moduleBonusDgts.contact;
      armesContact[i].system.degats.module.variable = moduleBonusDgtsVariable.contact;

      armesContact[i].system.violence.module = {};
      armesContact[i].system.violence.module.fixe = moduleBonusViolence.contact;
      armesContact[i].system.violence.module.variable = moduleBonusViolenceVariable.contact;
    }

    for(let i = 0;i < armesDistance.length;i++) {
      armesDistance[i].system.degats.module = {};
      armesDistance[i].system.degats.module.fixe = moduleBonusDgts.distance;
      armesDistance[i].system.degats.module.variable = moduleBonusDgtsVariable.distance;

      armesDistance[i].system.violence.module = {};
      armesDistance[i].system.violence.module.fixe = moduleBonusViolence.distance;
      armesDistance[i].system.violence.module.variable = moduleBonusViolenceVariable.distance;
    }

    for (let [key, value] of Object.entries(aspectsMax)) {
      effects.capacites.push({
        key: `system.aspects.${key}.max`,
        mode: 5,
        priority: null,
        value: `${Math.max(...value.max)}`
      },
      {
        key: `system.aspects.${key}.ae.majeur.max`,
        mode: 5,
        priority: null,
        value: `${Math.max(...value.ae.majeur)}`
      },
      {
        key: `system.aspects.${key}.ae.mineur.max`,
        mode: 5,
        priority: null,
        value: `${Math.max(...value.ae.mineur)}`
      }
      );
    }

    const listWithEffect = [
      {label:'Modules', data:effects.modules},
      {label:'Capacites', data:effects.capacites},
      {label:'Armes', data:effects.armes},
    ];

    if(sheetData.editable) effectsGestion(this.actor, listWithEffect);

    actorData.armesContact = armesContact;
    actorData.armesDistance = armesDistance;
    actorData.armesTourelles = armesTourelles;
    actorData.langue = langue;
    actorData.capacites = capacites;
    actorData.modules = modules;
    actorData.art = art;
    actorData.armureData = armureData;
    actorData.longbow = longbow;
  }

  _prepareAE(context) {
    const actor = context.actor?.aspectexceptionnel || false;
    const listAspects = context.data.system.aspects;
    //const aspects = context.actor?.aspectexceptionnel?.[aspect] || false;

    if(!actor) context.actor.aspectexceptionnel = {};

    let result = {};

    for (let [key, aspect] of Object.entries(listAspects)){
      const aeMineur = +aspect.ae.mineur.value;
      const aeMajeur = +aspect.ae.majeur.value;
      const lMineur = `KNIGHT.ASPECTS.${key.toUpperCase()}.AE.Mineur`;
      const lMajeur = `KNIGHT.ASPECTS.${key.toUpperCase()}.AE.Majeur`;

      if(aeMineur > 0 || aeMajeur > 0) result[key] = {}

      if(aeMineur > 0) {
        result[key].mineur = game.i18n.localize(lMineur);
      }

      if(aeMajeur > 0) {
        result[key].mineur = game.i18n.localize(lMineur);
        result[key].majeur = game.i18n.localize(lMajeur);
      }
    }

    context.actor.aspectexceptionnel = result;
  }

  _depensePE(depense, autosubstract=true) {
    const getData = this.getData();

    const actuel = +getData.systemData.energie.value;
    const substract = actuel-depense;

    if(substract < 0) {
      return false;
    } else {

      if(autosubstract) {
        let update = {
          system:{
            energie:{
              value:substract
            }
          }
        }

        this.actor.update(update);
      }

      return true;
    }
  }

  async _doDgts(label, dataWpn, listAllEffets, regularite=0, addNum='', tenebricide) {
    const actor = this.actor;

    //DEGATS
    const bourreau = listAllEffets.bourreau;
    const bourreauValue = listAllEffets.bourreauValue;

    const dgtsDice = dataWpn?.dice || 0;
    const dgtsFixe = dataWpn?.fixe || 0;

    let diceDgts = dgtsDice+listAllEffets.degats.totalDice;
    let bonusDgts = dgtsFixe+listAllEffets.degats.totalBonus;

    bonusDgts += regularite;

    const labelDgt = `${label} : ${game.i18n.localize('KNIGHT.AUTRE.Degats')}${addNum}`;
    const totalDiceDgt = tenebricide === true ? Math.floor(diceDgts/2) : diceDgts;

    const totalDgt = `${Math.max(totalDiceDgt, 0)}d6+${bonusDgts}`;

    const execDgt = new game.knight.RollKnight(`${totalDgt}`, actor.system);
    execDgt._success = false;
    execDgt._hasMin = bourreau ? true : false;

    if(bourreau) {
      execDgt._seuil = bourreauValue;
      execDgt._min = 4;
    }

    await execDgt.evaluate(listAllEffets.degats.minMax);

    let effets = listAllEffets;

    if(effets.regularite) {
      const regulariteIndex = effets.degats.include.findIndex(str => { if(str.name.includes(game.i18n.localize(CONFIG.KNIGHT.effets['regularite'].label))) return true; });
      effets.degats.include[regulariteIndex].name = `+${regularite} ${effets.degats.include[regulariteIndex].name}`;

      effets.degats.include.sort(SortByName);
    }

    let sub = effets.degats.list;
    let include = effets.degats.include;

    if(sub.length > 0) { sub.sort(SortByName); }
    if(include.length > 0) { include.sort(SortByName); }

    const pDegats = {
      flavor:labelDgt,
      main:{
        total:execDgt._total,
        tooltip:await execDgt.getTooltip(),
        formula: execDgt._formula
      },
      sub:sub,
      include:include
    };

    const dgtsMsgData = {
      user: game.user.id,
      speaker: {
        actor: actor?.id || null,
        token: actor?.token?.id || null,
        alias: actor?.name || null,
      },
      type: CONST.CHAT_MESSAGE_TYPES.OTHER,
      content: await renderTemplate('systems/knight/templates/dices/wpn.html', pDegats),
      sound: CONFIG.sounds.dice
    };

    const rMode = game.settings.get("core", "rollMode");
    const msgData = ChatMessage.applyRollMode(dgtsMsgData, rMode);

    await ChatMessage.create(msgData, {
      rollMode:rMode
    });
  }

  async _doViolence(label, dataWpn, listAllEffets, bViolence=0, addNum='') {
    const actor = this.actor;

    //VIOLENCE
    const tenebricide = false;
    const devastation = listAllEffets.devastation;
    const devastationValue = listAllEffets.devastationValue;

    const violenceDice = dataWpn?.dice || 0;
    const violenceFixe = dataWpn?.fixe || 0;

    let diceViolence = violenceDice+listAllEffets.violence.totalDice;
    let bonusViolence = violenceFixe+listAllEffets.violence.totalBonus;

    bonusViolence += bViolence;

    const labelViolence = `${label} : ${game.i18n.localize('KNIGHT.AUTRE.Violence')}${addNum}`;
    const totalDiceViolence = tenebricide === true ? Math.floor(diceViolence/2) : diceViolence;

    const totalViolence = `${Math.max(totalDiceViolence, 0)}d6+${bonusViolence}`;

    const execViolence = new game.knight.RollKnight(`${totalViolence}`, actor.system);
    execViolence._success = false;
    execViolence._hasMin = devastation ? true : false;

    if(devastation) {
      execViolence._seuil = devastationValue;
      execViolence._min = 5;
    }

    await execViolence.evaluate(listAllEffets.violence.minMax);

    let sub = listAllEffets.violence.list;
    let include = listAllEffets.violence.include;

    if(sub.length > 0) { sub.sort(SortByName); }
    if(include.length > 0) { include.sort(SortByName); }

    const pViolence = {
      flavor:labelViolence,
      main:{
        total:execViolence._total,
        tooltip:await execViolence.getTooltip(),
        formula: execViolence._formula
      },
      sub:sub,
      include:include
    };

    const violenceMsgData = {
      user: game.user.id,
      speaker: {
        actor: actor?.id || null,
        token: actor?.token?.id || null,
        alias: actor?.name || null,
      },
      type: CONST.CHAT_MESSAGE_TYPES.OTHER,
      content: await renderTemplate('systems/knight/templates/dices/wpn.html', pViolence),
      sound: CONFIG.sounds.dice
    };

    const rMode = game.settings.get("core", "rollMode");
    const msgData = ChatMessage.applyRollMode(violenceMsgData, rMode);

    await ChatMessage.create(msgData, {
      rollMode:rMode
    });
  }

  async _getAllEffets(dataWpn, tenebricide, obliteration) {
    const actor = this.actor;
    const data = {
      guidage:false,
      barrage:true,
      tenebricide:tenebricide,
      obliteration:obliteration
    };

    const effetsWpn = dataWpn.effets;
    const distanceWpn = {raw:[], custom:[]};
    const ornementalesWpn = {raw:[], custom:[]};
    const structurellesWpn = {raw:[], custom:[]};
    const lDgtsOtherInclude = [];

    const listEffets = await getEffets(actor, '', '', data, effetsWpn, distanceWpn, structurellesWpn, ornementalesWpn, true);

    let getDgtsOtherFixeMod = 0;

    // Aspects Exceptionnels
    const bete = +getAspectValue('bete', this.actor._id);
    const beteAE = getAEValue('bete', this.actor._id);

    const bAEMajeur = +beteAE.majeur;
    const bAEMineur = +beteAE.majeur;

    if(bAEMineur > 0 && bAEMajeur === 0) {
      lDgtsOtherInclude.push({
        name:`+${bAEMineur} ${game.i18n.localize('KNIGHT.JETS.BETE.Mineur')} (${game.i18n.localize('KNIGHT.AUTRE.Inclus')})`,
        desc:``
      });

      getDgtsOtherFixeMod += bAEMineur;
    } else if(bAEMajeur > 0) {
      lDgtsOtherInclude.push({
        name:`+${bAEMineur+bAEMajeur+bete} ${game.i18n.localize('KNIGHT.JETS.BETE.Majeur')} (${game.i18n.localize('KNIGHT.AUTRE.Inclus')})`,
        desc:``
      });

      getDgtsOtherFixeMod += bAEMineur+bAEMajeur+bete;
    }

    const lEffetAttack = listEffets.attack;
    const lEffetDegats = listEffets.degats;
    const lEffetViolence = listEffets.violence;
    const lEffetOther = listEffets.other;

    // ATTAQUE
    const attackDice = lEffetAttack.totalDice;
    const attackBonus = lEffetAttack.totalBonus;
    const attackInclude = lEffetAttack.include;
    const attackList = lEffetAttack.list;

    // DEGATS
    const degatsDice = lEffetDegats.totalDice;
    const degatsBonus = lEffetDegats.totalBonus+getDgtsOtherFixeMod;
    const degatsInclude = lEffetDegats.include.concat(lDgtsOtherInclude);
    const degatsList = lEffetDegats.list;
    const minMaxDgts = lEffetDegats.minMax;

    // VIOLENCE
    const violenceDice = lEffetViolence.totalDice;
    const violenceBonus = lEffetViolence.totalBonus;
    const violenceInclude = lEffetViolence.include;
    const violenceList = lEffetViolence.list;
    const minMaxViolence = lEffetViolence.minMax;

    // AUTRE
    const other = lEffetOther;

    attackInclude.sort(SortByName);
    attackList.sort(SortByName);
    degatsInclude.sort(SortByName);
    degatsList.sort(SortByName);
    violenceInclude.sort(SortByName);
    violenceList.sort(SortByName);
    other.sort(SortByName);

    const merge = {
      attack:{
        totalDice:attackDice,
        totalBonus:attackBonus,
        include:attackInclude,
        list:attackList
      },
      degats:{
        totalDice:degatsDice,
        totalBonus:degatsBonus,
        include:degatsInclude,
        list:degatsList,
        minMax:minMaxDgts,
      },
      violence:{
        totalDice:violenceDice,
        totalBonus:violenceBonus,
        include:violenceInclude,
        list:violenceList,
        minMax:minMaxViolence,
      },
      other:other
    };

    const nRoll = listEffets.nRoll;

    const result = {
      guidage:listEffets.guidage,
      regularite:listEffets.regularite,
      bourreau:listEffets.bourreau,
      bourreauValue:listEffets.bourreauValue,
      devastation:listEffets.devastation,
      devastationValue:listEffets.devastationValue,
      barrageValue:listEffets.barrageValue,
      depenseEnergie:listEffets.depenseEnergie,
      onlyAttack:listEffets.onlyAttack,
      onlyDgts:listEffets.onlyDgts,
      onlyViolence:listEffets.onlyViolence,
      nRoll:nRoll,
      attack:merge.attack,
      degats:merge.degats,
      violence:merge.violence,
      other:merge.other
    };

    return result;
  }

  _prepareTranslation(actor, system) {
    const { modules,
      armesContact, armesDistance,
      armesTourelles } = actor;
    const grenades = system.combat.grenades.liste;
    const { armureData, armureLegendeData } = actor;
    const capacites = armureData?.system?.capacites?.selected ?? {};
    const special = armureData?.system?.special?.selected ?? {};
    const legend = armureLegendeData?.capacites?.selected ?? {};
    const listToVerify = {...capacites, ...special};
    const labels = Object.assign({},
      CONFIG.KNIGHT.effets,
      CONFIG.KNIGHT.AMELIORATIONS.distance,
      CONFIG.KNIGHT.AMELIORATIONS.structurelles,
      CONFIG.KNIGHT.AMELIORATIONS.ornementales
    );
    const wpnModules = [
      {data:modules, key:'modules'},
      {data:armesContact, key:'armes'},
      {data:armesDistance, key:'armes'},
      {data:armesTourelles, key:'armes'},
      {data:grenades, key:'grenades'},
    ];

    const list = [
      { name: 'borealis', path: ['offensif'] },
      { name: 'changeling', path: ['desactivationexplosive'] },
      { name: 'companions', path: ['lion.contact.coups', 'wolf.contact.coups', 'wolf.configurations.fighter.bonus'] },
      { name: 'cea', path: ['salve', 'vague', 'rayon'] },
      { name: 'illumination', path: ['lantern'] },
      { name: 'longbow', path: ['effets.base', 'effets.liste1', 'effets.liste2', 'effets.liste3', 'distance'], simple:true },
      { name: 'morph', path: ['polymorphie.griffe', 'polymorphie.lame', 'polymorphie.canon'] },
      { name: 'oriflamme', path: [''] },
      { name: 'porteurlumiere', path: ['bonus'] },
    ];

    this._updateEffects(listToVerify, list, labels);
    this._updateEffects(legend, list, labels);

    for(let i = 0;i < wpnModules.length;i++) {
      const base = wpnModules[i];
      const data = base.data;

      if(!data) continue;

      const listData = {
        modules:[{path:['system.effets', 'system.arme.effets', 'system.arme.distance', 'system.arme.structurelles', 'system.arme.ornementales', 'system.jetsimple.effets'], simple:true}],
        armes:[{path:['system.effets', 'system.effets2mains', 'system.distance', 'system.structurelles', 'system.ornementales'], simple:true}],
        grenades:[{path:['effets'], simple:true}]
      }[base.key];

      this._updateEffects(data, listData, labels, true);

      for(let n = 0;n < data.length;n++) {
        const optMun = data[n]?.system?.optionsmunitions?.has || false;

        if((base.key === 'armes' && optMun)) {
          const dataMunitions = data[n].system.optionsmunitions;

          for (const [key, value] of Object.entries(dataMunitions.liste)) {
            value.liste = listEffects(value.raw, value.custom, labels);
          }
        }
      }
    }
  }

  _updateEffects(listToVerify, list, labels, items = false) {
    const process = (capacite, path, simple) => {
      const data = path.split('.').reduce((obj, key) => obj?.[key], capacite);
      if (!data) return;
      const effets = simple ? data : data.effets;
      effets.liste = listEffects(effets.raw, effets.custom, labels);
    };

    if (!items) {
      for (const { name, path, simple } of list) {
        const capacite = listToVerify?.[name];
        if (!capacite) continue;
        path.forEach(p => process(capacite, p, simple));
      }
    } else {
      if (!listToVerify) return;
      for (const [key, module] of Object.entries(listToVerify)) {
        for (const { path, simple } of list) {
          path.forEach(p => process(module, p, simple));
        }
      }
    }
  }

  /** @inheritdoc */
  _onDragStart(event) {
    const li = event.currentTarget;
    if ( event.target.classList.contains("content-link") ) return;

    // Create drag data
    let dragData;

    // Owned Items
    if ( li.dataset.itemId ) {
      const item = this.actor.items.get(li.dataset.itemId);
      dragData = item.toDragData();
    }

    // Active Effect
    if ( li.dataset.effectId ) {
      const effect = this.actor.effects.get(li.dataset.effectId);
      dragData = effect.toDragData();
    }

    dragData = dragMacro(dragData, li, this.actor);

    if ( !dragData ) return;

    // Set data transfer
    event.dataTransfer.setData("text/plain", JSON.stringify(dragData));
  }
}
