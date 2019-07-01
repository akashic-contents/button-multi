import {Label} from "@akashic-extension/akashic-label";


function main(param: g.GameMainParameterObject): void {
    const MAXIMUM_BUTTON_TIMER_COUNT: number = 150;

    let timer: number = 0;
    let buttonDisabled: boolean = false;

    let button: g.Sprite;
    const scoreTable: { [key: string]: number } = {};

    const scene = new g.Scene({
        game: g.game,
        assetIds: ["button", "se"]
    });

    const font = new g.DynamicFont({game: g.game, fontFamily: g.FontFamily.SansSerif, size: 20});
    const rankingLabel = new Label({
        scene: scene,
        font: font,
        text: "ランキング",
        fontSize: 20,
        textColor: "white",
        width: 100
    });

    // 自分のスコア表示用ラベル。人によって状態が変わるものは理由がなければローカルエンティティにする
    const myScoreLabel = new Label({
        scene: scene,
        font: font,
        text: "score:\n0pt",
        fontSize: 20,
        textColor: "white",
        width: 100,
        local: true // ローカルエンティティ宣言
    });

    scene.loaded.add(() => {
        // 背景とスコアボード用背景の初期化
        const scoreBoard = new g.FilledRect({
            scene: scene,
            cssColor: "black",
            height: g.game.height,
            width: g.game.width / 5
        });
        const background = new g.FilledRect({
            scene: scene,
            cssColor: "rgba(0,0,0,0.2)",
            height: g.game.height,
            width: g.game.width - scoreBoard.width
        });
        scoreBoard.x = g.game.width - scoreBoard.width;
        scene.append(background);
        scene.append(scoreBoard);

        // ボタンの初期化
        button = new g.Sprite({scene: scene, src: scene.assets["button"], touchable: true});
        button.y = (g.game.height / 2) - (button.height / 2);
        button.x = (background.width / 2) - (button.width / 2);
        scene.append(button);

        // ランキング用テキストの配置
        rankingLabel.x = scoreBoard.x;
        rankingLabel.width = scoreBoard.width;
        rankingLabel.modified();
        scene.append(rankingLabel);

        // 自分のスコア用テキストの配置
        myScoreLabel.x = scoreBoard.x;
        myScoreLabel.y = scoreBoard.height - 50;
        scene.append(myScoreLabel);

        // ボタンタイマーを初期化
        timer = g.game.random.get(30, MAXIMUM_BUTTON_TIMER_COUNT);

        // ボタンを押された時の処理
        button.pointDown.add((event) => {
            if (buttonDisabled) {
                return;
            }

            // ボタンが押せるようになってからの経過時間が少ないほどスコアが高い
            const score = 1 + Math.floor((1000) / (-timer));
            if (scoreTable[event.player.id] == null) {
                scoreTable[event.player.id] = 0;
            }
            scoreTable[event.player.id] += score;
            timer = g.game.random.get(30, MAXIMUM_BUTTON_TIMER_COUNT);

            // スコアボードの処理 スコアボードを元に点数の配列を作り、上位５名を出す
            const topFive = Object.keys(scoreTable).map((id: string) => {
                return {score: scoreTable[id], id: id};
            }).sort((a, b) => {
                return b.score - a.score;
            }).slice(0, 5);

            // その５名を表示するテキストを作る
            let rankingText = "ランキング\n";
            topFive.forEach((score, rank) => {
                rankingText += `${rank + 1}位: ${score.id}さん(${score.score}pt)\n`;
            });
            rankingLabel.text = rankingText;
            rankingLabel.invalidate();

            // 自分のスコアを表示する処理
            const myScore = (scoreTable[g.game.selfId]) ? scoreTable[g.game.selfId] : 0;

            // 自分のスコアが1位かそうでないかで演出を変える。これは人によって違うのでローカル処理
            myScoreLabel.text = `score:\n${myScore}pt`;
            if (topFive[0] && topFive[0].id === g.game.selfId) {
                myScoreLabel.textColor = "red";
            } else {
                myScoreLabel.textColor = "white";
            }
            // ここまでローカル処理 ------------------------------------------------------
            myScoreLabel.invalidate();
        });
    });

    // メインループ
    scene.update.add(() => {
        timer--;
        // タイマーが1以上でボタンが有効の時はボタンを無効にする
        if (timer > 0 && !buttonDisabled) {
            button.opacity = 0.2;
            button.modified();
            buttonDisabled = true;
        } else if (timer === 0 && buttonDisabled) {
            button.opacity = 1;
            button.modified();
            buttonDisabled = false;
        }
    });

    g.game.pushScene(scene);
}

export = main;
