<?php
/**
 * Shortcodes for Woodworkers Tools
 * - Board‑Foot Calculator          [board_foot_calculator]
 * - Sheet‑Goods Yield Calculator   [sheet_yield_calculator]
 * - Wood Weight Estimator          [wood_weight_estimator]
 * - Wood Movement Predictor        [wood_movement_predictor]
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

function wwt_board_foot_shortcode() {

    wp_enqueue_style( 'wwt-style' );
    wp_enqueue_script( 'wwt-board' );

    ob_start(); ?>
    <div class="wwt-board-foot" data-wwt-component="board-foot">

      <!-- Cost per bd-ft -->
      <label class="wwt-cost-rate">
        <?php esc_html_e( 'Cost per bd ft $', 'woodworkers-tools' ); ?>
        <input type="number" step="0.01" data-cost placeholder="e.g. 2.50">
      </label>

      <table class="wwt-table">
        <thead>
          <tr>
            <th><?php esc_html_e( 'Thickness (in)', 'woodworkers-tools' ); ?></th>
            <th><?php esc_html_e( 'Width (in)', 'woodworkers-tools' ); ?></th>
            <th><?php esc_html_e( 'Length (ft or in)', 'woodworkers-tools' ); ?></th>
            <th><?php esc_html_e( 'Bd Ft', 'woodworkers-tools' ); ?></th>
            <th></th>
          </tr>
        </thead>
        <tbody data-rows></tbody>
      </table>

      <button type="button" class="wwt-btn" data-add-row>
        + <?php esc_html_e( 'Add board', 'woodworkers-tools' ); ?>
      </button>

      <p class="wwt-total">
        <?php esc_html_e( 'Total:', 'woodworkers-tools' ); ?>
        <strong><span data-total>0</span> bd ft</strong>
      </p>

      <p class="wwt-total-cost" data-total-cost style="display:none;"></p>

    </div>
    <?php
    return ob_get_clean();
}
add_shortcode( 'board_foot_calculator', 'wwt_board_foot_shortcode' );

function wwt_sheet_yield_shortcode() {

  wp_enqueue_style( 'wwt-style' );
  wp_enqueue_script( 'wwt-yield' );

  ob_start(); ?>
  <div class="wwt-sheet-yield" data-wwt-component="sheet-yield">

    <label>
      <?php esc_html_e( 'Sheet size:', 'woodworkers-tools' ); ?>
      <select data-sheet>
        <option value="" disabled selected>— select —</option>
      </select>
      <div class="wwt-custom-sheet" style="display:none; margin-top:.5rem">
        <input type="number" step="0.1" data-custom-w
               placeholder="<?php esc_attr_e( 'Width (in)',  'woodworkers-tools' ); ?>"
               style="width:6em">
        <input type="number" step="0.1" data-custom-h
               placeholder="<?php esc_attr_e( 'Length (in)', 'woodworkers-tools' ); ?>"
               style="width:6em">
        <span style="font-size:.9em; color:#666; margin-left:.5em;">
          <?php esc_html_e( 'inches', 'woodworkers-tools' ); ?>
        </span>
      </div>
    </label>

    <label>
      <?php esc_html_e( 'Kerf (in):', 'woodworkers-tools' ); ?>
      <input type="number" step="0.001" data-kerf value="0.125">
    </label>

    <label style="margin-left:1rem">
      <input type="checkbox" data-rotate checked>
      <?php esc_html_e( 'Allow rotation', 'woodworkers-tools' ); ?>
    </label>

    <table class="wwt-table">
      <thead>
        <tr>
          <th><?php esc_html_e( 'Part W (in)', 'woodworkers-tools' ); ?></th>
          <th><?php esc_html_e( 'Part L (in)', 'woodworkers-tools' ); ?></th>
          <th><?php esc_html_e( 'Qty',        'woodworkers-tools' ); ?></th>
          <th><?php esc_html_e( 'Grain',      'woodworkers-tools' ); ?></th>
          <th></th>
        </tr>
      </thead>
      <tbody data-rows></tbody>
    </table>

    <button type="button" class="wwt-btn" data-add-row>
      + <?php esc_html_e( 'Add part', 'woodworkers-tools' ); ?>
    </button>

    <p class="wwt-summary">
      <?php esc_html_e( 'Sheets needed:', 'woodworkers-tools' ); ?>
      <strong data-sheet-count>0</strong>
    </p>

    <div data-legend class="wwt-legend"></div>
    <div data-output></div>
  </div>
  <?php
  return ob_get_clean();
}
add_shortcode( 'sheet_yield_calculator', 'wwt_sheet_yield_shortcode' );


function wwt_weight_estimator_shortcode() {

    wp_enqueue_style( 'wwt-style' );
    wp_enqueue_script( 'wwt-weight' );

    ob_start(); ?>
    <div class="wwt-weight" data-wwt-component="weight">

      <!-- Units toggle -->
      <fieldset class="wwt-units-toggle">
        <legend><?php esc_html_e( 'Units', 'woodworkers-tools' ); ?></legend>
        <label>
          <input type="radio" name="wwt-unit-system" value="imperial" data-unit-system checked>
          <?php esc_html_e( 'Imperial (in-ft, lb)', 'woodworkers-tools' ); ?>
        </label>
        <label>
          <input type="radio" name="wwt-unit-system" value="metric" data-unit-system>
          <?php esc_html_e( 'Metric (mm-m, kg)', 'woodworkers-tools' ); ?>
        </label>
      </fieldset>

      <!-- Species dropdown -->
      <label>
        <?php esc_html_e( 'Wood species:', 'woodworkers-tools' ); ?>
        <select data-species></select>
      </label>

      <!-- Dimension / volume table -->
      <table class="wwt-table">
        <thead>
          <tr>
            <th><?php esc_html_e( 'T', 'woodworkers-tools' ); ?></th>
            <th><?php esc_html_e( 'W', 'woodworkers-tools' ); ?></th>
            <th><?php esc_html_e( 'L', 'woodworkers-tools' ); ?></th>
            <th data-vol-header><?php esc_html_e( 'Volume', 'woodworkers-tools' ); ?></th>
            <th></th>
          </tr>
        </thead>
        <tbody data-rows></tbody>
      </table>

      <button type="button" class="wwt-btn" data-add-row>
        + <?php esc_html_e( 'Add board', 'woodworkers-tools' ); ?>
      </button>

      <!-- Totals -->
      <p class="wwt-total">
        <?php esc_html_e( 'Total volume:', 'woodworkers-tools' ); ?>
        <span data-total-vol>0</span>
        <span data-vol-unit>bd ft</span>
      </p>

      <p class="wwt-total">
        <?php esc_html_e( 'Weight:', 'woodworkers-tools' ); ?>
        <span data-total-wt>0</span>
        <span data-wt-unit>lb</span>
      </p>

    </div>
    <?php
    return ob_get_clean();
}
add_shortcode( 'wood_weight_estimator', 'wwt_weight_estimator_shortcode' );

function wwt_movement_predictor_shortcode() {

    wp_enqueue_style( 'wwt-style' );
    wp_enqueue_script( 'wwt-move' );

    wp_add_inline_script(
        'wwt-move',
        'const woodtools_assets_url = "' . esc_js( WWT_URL ) . 'assets/";',
        'before'
    );

    $radio = 'orient_' . wp_generate_uuid4();

    ob_start(); ?>
    <div class="wwt-movement" data-wwt-component="movement">

        <!-- dataset wrapper -->
        <div class="wwt-set" data-set="1">

            <label>
                <?php esc_html_e( 'Species', 'woodworkers-tools' ); ?>
                <select data-species data-set="1"></select>
            </label>

            <fieldset>
                <legend><?php esc_html_e( 'Orientation', 'woodworkers-tools' ); ?></legend>
                <label><input type="radio" name="<?php echo esc_attr( $radio ); ?>" value="flat" data-orient data-set="1" checked>
                    <?php esc_html_e( 'Flatsawn', 'woodworkers-tools' ); ?></label>
                <label><input type="radio" name="<?php echo esc_attr( $radio ); ?>" value="quarter" data-orient data-set="1">
                    <?php esc_html_e( 'Quartersawn', 'woodworkers-tools' ); ?></label>
            </fieldset>

            <!-- width + unit -->
            <div class="wwt-width-row">
                <label style="flex:1">
                    <?php esc_html_e( 'Board width', 'woodworkers-tools' ); ?>
                    <input type="number" step="0.01" data-width data-set="1">
                </label>

                <label class="wwt-unit-label">
                    <?php esc_html_e( 'Units', 'woodworkers-tools' ); ?><br>
                    <select data-unit data-set="1">
                        <option value="in">in</option>
                        <option value="mm">mm</option>
                    </select>
                </label>
            </div>

            <!-- MC inputs -->
            <div class="wwt-mc-row">
                <label>
                    <?php esc_html_e( 'Starting MC (%)', 'woodworkers-tools' ); ?>
                    <input type="number" step="0.1" data-mc1 data-set="1" value="8">
                </label>
                <label>
                    <?php esc_html_e( 'Final MC (%)', 'woodworkers-tools' ); ?>
                    <input type="number" step="0.1" data-mc2 data-set="1" value="12">
                </label>
            </div>
        </div>

        <!-- action buttons -->
        <div class="wwt-action-row">
            <button type="button" class="wwt-btn" data-emc><?php esc_html_e( 'Auto‑fill MC from climate', 'woodworkers-tools' ); ?></button>
            <button type="button" class="wwt-btn" data-compare><?php esc_html_e( 'Add comparison', 'woodworkers-tools' ); ?></button>
        </div>

        <small class="wwt-hint">
    <?php esc_html_e( 'Note: Auto-fill estimates the equilibrium moisture content (EMC) based on current outdoor conditions. '
                    . 'Adjust this value if your project will be used in a climate-controlled environment. See the guide for typical indoor values.', 'woodworkers-tools' ); ?>
</small>


        <!-- result lines -->
        <p class="wwt-result" data-line="1">
            <?php esc_html_e( 'Predicted change:', 'woodworkers-tools' ); ?>
            <strong data-out-abs>0.000&nbsp;in</strong>
            <span  data-out-pct>(0.00&nbsp;%)</span>
        </p>

        <p class="wwt-result" data-line="2" style="display:none">
            <?php esc_html_e( 'Predicted change:', 'woodworkers-tools' ); ?>
            <strong data-out-abs>0.000&nbsp;in</strong>
            <span  data-out-pct>(0.00&nbsp;%)</span>
        </p>

        <!-- chart -->
        <p class="wwt-chart-label"><?php esc_html_e( 'Monthly width change', 'woodworkers-tools' ); ?></p>
        <canvas data-chart width="540" height="120"></canvas>

        <!-- thumb‑rule quick‑reference -->
<details class="wwt-mc-thumb">
  <summary><?php esc_html_e( 'Moisture‑Content Thumb Rules', 'woodworkers-tools' ); ?></summary>

  <ul>
    <li><strong>Green lumber</strong>: 30–100 % MC — will shrink a lot.</li>
    <li><strong>Air‑dried outdoors</strong>: 12–20 % MC (matches local climate).</li>
    <li><strong>Shop‑acclimated</strong>: 9–12 % MC after a few weeks indoors.</li>
    <li><strong>Kiln‑dried construction grade</strong>: 10–15 % MC.</li>
    <li><strong>Furniture‑grade kiln‑dried</strong>: 6–8 % MC (KD 8 or KD 6).</li>
    <li><em>Quick estimate</em>: EMC ≈ RH ÷ 5. Example 35 % RH → ~7 % MC.</li>
  </ul>
</details>


        <small><?php esc_html_e( 'Coefficients from FPL Wood Handbook, Table 4‑3. Results assume clear, defect‑free lumber.', 'woodworkers-tools' ); ?></small>
    </div>
    <?php
    return ob_get_clean();
}
add_shortcode( 'wood_movement_predictor', 'wwt_movement_predictor_shortcode' );
