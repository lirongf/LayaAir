import { BlinnPhongMaterial } from "laya/d3/core/material/BlinnPhongMaterial";
import { MeshRenderer } from "laya/d3/core/MeshRenderer";
import { MeshSprite3DShaderDeclaration } from "laya/d3/core/MeshSprite3DShaderDeclaration";
import { BaseRender } from "laya/d3/core/render/BaseRender";
import { RenderContext3D } from "laya/d3/core/render/RenderContext3D";
import { RenderElement } from "laya/d3/core/render/RenderElement";
import { RenderableSprite3D } from "laya/d3/core/RenderableSprite3D";
import { Sprite3D } from "laya/d3/core/Sprite3D";
import { Transform3D } from "laya/d3/core/Transform3D";
import { BoundFrustum } from "laya/d3/math/BoundFrustum";
import { Matrix4x4 } from "laya/d3/math/Matrix4x4";
import { LayaWorldGeometry } from "./LayaWorldGeometry";

/**
 * @author：miner
 */
export class LayaWorldRender extends BaseRender {

    /** @internal */
	protected _projectionViewWorldMatrix: Matrix4x4;
    constructor(owner: RenderableSprite3D){
        //@ts-ignore
        super(owner);

        //@ts-ignore
        this._shaderValues.addDefine(MeshSprite3DShaderDeclaration.SHADERDEFINE_COLOR);
        //@ts-ignore
        this._shaderValues.addDefine(MeshSprite3DShaderDeclaration.SHADERDEFINE_UV0);
        this._projectionViewWorldMatrix = new Matrix4x4();
        this.setRenderElement();
    }

    setRenderElement(){
        var architectGeometry:LayaWorldGeometry = new LayaWorldGeometry();
        //@ts-ignore
        var renderElement:RenderElement = new RenderElement();
        //@ts-ignore
        renderElement.setTransform(this._owner.transform);
        //@ts-ignore
        renderElement.setGeometry(architectGeometry);
        //@ts-ignore
        renderElement.render = this;
        //@ts-ignore
        renderElement.material =this.sharedMaterials[0]?this.sharedMaterials[0]: BlinnPhongMaterial.defaultMaterial;//确保有材质,由默认材质代替。
        //@ts-ignore
        this._renderElements.push(renderElement);
    }

    /**
	 * @inheritDoc
	 * @override
	 * @internal
	 */
    protected _calculateBoundingBox():void{

    }


    /**
	 * @inheritDoc
	 * @override
	 * @internal
	 */
	_needRender(boundFrustum: BoundFrustum, context: RenderContext3D): boolean {
			return true;
	}


    	/**
	 * @inheritDoc
	 * @override
	 * @internal
	 */
	_renderUpdate(context: RenderContext3D, transform: Transform3D): void {
    
        if (transform)
            //@ts-ignore
            this._shaderValues.setMatrix4x4(Sprite3D.WORLDMATRIX, transform.worldMatrix);
		else
            //@ts-ignore
            this._shaderValues.setMatrix4x4(Sprite3D.WORLDMATRIX, Matrix4x4.DEFAULT);
    }

    /**
     * @inheritDoc
     */
    _renderUpdateWithCamera(context:RenderContext3D, transform:Transform3D):void {
    //@ts-ignore
        var projectionView:Matrix4x4 = context.projectionViewMatrix;
        if (transform) {
            //@ts-ignore
            Matrix4x4.multiply(projectionView, transform.worldMatrix, this._projectionViewWorldMatrix);
            //@ts-ignore
            this._shaderValues.setMatrix4x4(Sprite3D.MVPMATRIX,this._projectionViewWorldMatrix);
        } else {
            //@ts-ignore
            this._shaderValues.setMatrix4x4(Sprite3D.MVPMATRIX, projectionView);
        }
    }

    /**
	 * @inheritDoc
	 * @override
	 * @internal
	 */
	_destroy(): void {
        //@ts-ignore
		super._destroy();
	}


}