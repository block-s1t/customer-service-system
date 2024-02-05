import { Scenes, Context as BaseContext } from 'telegraf';
import { Update } from 'telegraf/typings/core/types/typegram';
import { SceneSessionData } from 'telegraf/typings/scenes';

export interface Context extends BaseContext {
  update: Update.MessageUpdate;
  session: SceneSessionData;
  scene: Scenes.SceneContextScene<BaseContext, Scenes.SceneSessionData>;
  match: any;
}
